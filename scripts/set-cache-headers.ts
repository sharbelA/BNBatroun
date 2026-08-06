import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env from .env.local (Next.js convention)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

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
const CACHE_CONTROL = "31536000"; // 1 year

const DRY_RUN = process.argv.includes("--dry-run");

const EXT_CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  avif: "image/avif",
  tif: "image/tiff",
  tiff: "image/tiff",
};

function guessContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXT_CONTENT_TYPES[ext] ?? "application/octet-stream";
}

interface FileEntry {
  name: string;
  fullPath: string;
  size: number;
  mimetype?: string;
}

/**
 * Recursively list all files in a bucket folder.
 * Supabase list() returns max 1000 items per call and doesn't recurse,
 * so we walk folders manually.
 */
async function listAllFiles(folder: string = ""): Promise<FileEntry[]> {
  const allFiles: FileEntry[] = [];

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
        allFiles.push({
          name: item.name,
          fullPath,
          size: (item.metadata as any)?.size ?? 0,
          mimetype: (item.metadata as any)?.mimetype,
        });
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return allFiles;
}

interface FileResult {
  path: string;
  size: number;
  applied: boolean;
  error?: string;
}

async function applyCacheHeader(file: FileEntry): Promise<FileResult> {
  // ─── 1. Download the file as-is (no resize/compress) ───
  const { data: blob, error: dlError } = await supabase.storage
    .from(BUCKET)
    .download(file.fullPath);

  if (dlError || !blob) {
    return {
      path: file.fullPath,
      size: file.size,
      applied: false,
      error: `Download failed: ${dlError?.message ?? "No data returned"}`,
    };
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  const contentType = file.mimetype ?? guessContentType(file.name);

  // ─── 2. Re-upload to the SAME path with a long cache header ───
  if (!DRY_RUN) {
    const { error: upError } = await supabase.storage
      .from(BUCKET)
      .upload(file.fullPath, buffer, {
        upsert: true,
        contentType,
        cacheControl: CACHE_CONTROL,
      });

    if (upError) {
      return {
        path: file.fullPath,
        size: file.size,
        applied: false,
        error: `Re-upload failed: ${upError.message}`,
      };
    }
  }

  return {
    path: file.fullPath,
    size: file.size,
    applied: true,
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
      : "🚀 APPLYING LONG CACHE HEADERS FOR REAL\n"
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

  let applied = 0;
  let errors = 0;
  const errorLog: string[] = [];

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    const progress = `[${i + 1}/${imageFiles.length}]`;

    try {
      const result = await applyCacheHeader(file);

      if (result.error) {
        console.error(`${progress} ❌ ${file.fullPath}: ${result.error}`);
        errorLog.push(`${file.fullPath}: ${result.error}`);
        errors++;
        continue;
      }

      console.log(
        `${progress} ✅ ${file.fullPath} (${formatBytes(file.size)}) — cache header applied`
      );
      applied++;
    } catch (err: any) {
      console.error(`${progress} ❌ ${file.fullPath}: UNEXPECTED ${err.message}`);
      errorLog.push(`${file.fullPath}: UNEXPECTED ${err.message}`);
      errors++;
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log(DRY_RUN ? "📊 DRY RUN SUMMARY" : "📊 CACHE HEADER SUMMARY");
  console.log("═══════════════════════════════════════");
  console.log(`  Images found:            ${imageFiles.length}`);
  console.log(
    `  Cache header applied to: ${applied}${DRY_RUN ? " (would be)" : ""}`
  );
  console.log(`  Errors:                  ${errors}`);
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
