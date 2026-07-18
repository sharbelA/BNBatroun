import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import dotenv from "dotenv";
import path from "path";

// Load env from .env.local (Next.js convention)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BUCKET = "listing-photos";
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 80;
const SKIP_UNDER_BYTES = 300 * 1024; // 300 KB

const DRY_RUN = process.argv.includes("--dry-run");

interface FileResult {
  path: string;
  originalSize: number;
  newSize: number;
  saved: number;
  skipped: boolean;
  error?: string;
}

/**
 * Recursively list all files in a bucket folder.
 * Supabase list() returns max 1000 items per call and doesn't recurse,
 * so we walk folders manually.
 */
async function listAllFiles(
  folder: string = ""
): Promise<{ name: string; fullPath: string; size: number }[]> {
  const allFiles: { name: string; fullPath: string; size: number }[] = [];

  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(folder, {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      console.error(`❌ Error listing folder "${folder}":`, error.message);
      break;
    }

    if (!data || data.length === 0) break;

    for (const item of data) {
      const fullPath = folder ? `${folder}/${item.name}` : item.name;

      if (item.id === null) {
        // It's a folder — recurse into it
        const nested = await listAllFiles(fullPath);
        allFiles.push(...nested);
      } else {
        // It's a file
        allFiles.push({
          name: item.name,
          fullPath,
          size: (item.metadata as any)?.size ?? 0,
        });
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return allFiles;
}

async function compressFile(filePath: string): Promise<FileResult> {
  // ─── 1. Download ───
  const { data: blob, error: dlError } = await supabase.storage
    .from(BUCKET)
    .download(filePath);

  if (dlError || !blob) {
    return {
      path: filePath,
      originalSize: 0,
      newSize: 0,
      saved: 0,
      skipped: true,
      error: `Download failed: ${dlError?.message ?? "No data returned"}`,
    };
  }

  const originalBuffer = Buffer.from(await blob.arrayBuffer());
  const originalSize = originalBuffer.length;

  // ─── 2. Skip small files ───
  if (originalSize < SKIP_UNDER_BYTES) {
    return {
      path: filePath,
      originalSize,
      newSize: originalSize,
      saved: 0,
      skipped: true,
    };
  }

  // ─── 3. Detect image format & transparency ───
  let metadata: sharp.Metadata;
  try {
    metadata = await sharp(originalBuffer).metadata();
  } catch (err: any) {
    return {
      path: filePath,
      originalSize,
      newSize: originalSize,
      saved: 0,
      skipped: true,
      error: `Can't read metadata (corrupt/unsupported): ${err.message}`,
    };
  }

  const hasAlpha = metadata.hasAlpha === true;
  const isPng = metadata.format === "png";

  // ─── 4. Compress ───
  // If PNG with transparency → keep as PNG (flatten would destroy transparency)
  // Everything else → JPEG (chalet photos are always opaque)
  let compressed: Buffer;
  let outputContentType: string;

  try {
    if (isPng && hasAlpha) {
      // Preserve as PNG, just resize + optimize
      compressed = await sharp(originalBuffer)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .png({ quality: JPEG_QUALITY, compressionLevel: 9 })
        .toBuffer();
      outputContentType = "image/png";
    } else {
      // Convert to optimized JPEG (flatten any alpha to white background)
      compressed = await sharp(originalBuffer)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
        .toBuffer();
      outputContentType = "image/jpeg";
    }
  } catch (err: any) {
    return {
      path: filePath,
      originalSize,
      newSize: originalSize,
      saved: 0,
      skipped: true,
      error: `Compression failed: ${err.message}`,
    };
  }

  // ─── 5. Validate the compressed image is readable ───
  try {
    const check = await sharp(compressed).metadata();
    if (!check.width || !check.height) {
      throw new Error("Output has no dimensions");
    }
  } catch (err: any) {
    return {
      path: filePath,
      originalSize,
      newSize: originalSize,
      saved: 0,
      skipped: true,
      error: `SAFETY: compressed image failed validation, skipping: ${err.message}`,
    };
  }

  const newSize = compressed.length;

  // ─── 6. If compression didn't help, skip but still set cache header ───
  if (newSize >= originalSize) {
    // Still worth setting cacheControl even if size didn't shrink
    if (!DRY_RUN) {
      const { error: upError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, originalBuffer, {
          upsert: true,
          contentType: outputContentType,
          cacheControl: "31536000",
        });

      if (upError) {
        return {
          path: filePath,
          originalSize,
          newSize: originalSize,
          saved: 0,
          skipped: false,
          error: `Cache-only re-upload failed: ${upError.message}`,
        };
      }
    }

    return {
      path: filePath,
      originalSize,
      newSize: originalSize,
      saved: 0,
      skipped: true,
    };
  }

  // ─── 7. Upload compressed version ───
  if (!DRY_RUN) {
    const { error: upError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, compressed, {
        upsert: true,
        contentType: outputContentType,
        cacheControl: "31536000", // 1 year
      });

    if (upError) {
      return {
        path: filePath,
        originalSize,
        newSize,
        saved: originalSize - newSize,
        skipped: false,
        error: `Upload failed (original untouched): ${upError.message}`,
      };
    }
  }

  return {
    path: filePath,
    originalSize,
    newSize,
    saved: originalSize - newSize,
    skipped: false,
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function main() {
  console.log(
    DRY_RUN
      ? "🔍 DRY RUN — no files will be modified\n"
      : "🚀 COMPRESSING FOR REAL\n"
  );

  console.log("📂 Listing all files in bucket...");
  const files = await listAllFiles();

  const imageFiles = files.filter((f) =>
    /\.(jpe?g|png|webp|heic|heif|avif|tiff?)$/i.test(f.name)
  );

  console.log(
    `Found ${files.length} total files, ${imageFiles.length} are images\n`
  );

  if (imageFiles.length === 0) {
    console.log("No images found. Check bucket name and folder structure.");
    return;
  }

  let totalOriginal = 0;
  let totalNew = 0;
  let processed = 0;
  let skipped = 0;
  let errors = 0;
  const errorLog: string[] = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const progress = `[${i + 1}/${imageFiles.length}]`;

    try {
      const result = await compressFile(file.fullPath);

      if (result.error) {
        console.error(`${progress} ❌ ${file.fullPath}: ${result.error}`);
        errorLog.push(`${file.fullPath}: ${result.error}`);
        errors++;
        totalOriginal += result.originalSize;
        totalNew += result.newSize;
        continue;
      }

      if (result.skipped) {
        console.log(
          `${progress} ⏭️  ${file.fullPath} (${formatBytes(result.originalSize)}) — skipped`
        );
        skipped++;
        totalOriginal += result.originalSize;
        totalNew += result.originalSize;
        continue;
      }

      const pct = ((result.saved / result.originalSize) * 100).toFixed(1);
      console.log(
        `${progress} ✅ ${file.fullPath}: ${formatBytes(result.originalSize)} → ${formatBytes(result.newSize)} (−${pct}%)`
      );

      totalOriginal += result.originalSize;
      totalNew += result.newSize;
      processed++;
    } catch (err: any) {
      console.error(`${progress} ❌ ${file.fullPath}: UNEXPECTED ${err.message}`);
      errorLog.push(`${file.fullPath}: UNEXPECTED ${err.message}`);
      errors++;
    }
  }

  const totalSaved = totalOriginal - totalNew;
  const totalPct =
    totalOriginal > 0
      ? ((totalSaved / totalOriginal) * 100).toFixed(1)
      : "0";

  console.log("\n═══════════════════════════════════════");
  console.log(DRY_RUN ? "📊 DRY RUN SUMMARY" : "📊 COMPRESSION SUMMARY");
  console.log("═══════════════════════════════════════");
  console.log(`  Images found:      ${imageFiles.length}`);
  console.log(`  Compressed:        ${processed}`);
  console.log(`  Skipped:           ${skipped}`);
  console.log(`  Errors:            ${errors}`);
  console.log(`  Total before:      ${formatBytes(totalOriginal)}`);
  console.log(`  Total after:       ${formatBytes(totalNew)}`);
  console.log(`  Total saved:       ${formatBytes(totalSaved)} (${totalPct}%)`);
  console.log("═══════════════════════════════════════\n");

  if (errorLog.length > 0) {
    console.log("⚠️  FILES WITH ERRORS:");
    errorLog.forEach((e) => console.log(`   • ${e}`));
    console.log("");
  }

  if (DRY_RUN) {
    console.log(
      "ℹ️  No files were changed. Run without --dry-run to apply.\n"
    );
  } else {
    console.log(
      "✅ Done! Open bnbatroun.com and verify images still load correctly.\n"
    );
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
