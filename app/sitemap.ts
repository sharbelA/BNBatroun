import type { MetadataRoute } from "next";
import { getActiveSlugs } from "@/lib/supabase/queries/listings";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bnbatroun.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, seasonalSlugs, saleSlugs] = await Promise.all([
    getActiveSlugs("daily"),
    getActiveSlugs("seasonal"),
    getActiveSlugs("sale"),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/chalets",
    "/seasonal",
    "/for-sale",
    "/about",
    "/list-your-chalet",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const listingRoutes: MetadataRoute.Sitemap = slugs.map(({ slug, updated_at }) => ({
    url: `${SITE_URL}/chalets/${slug}`,
    lastModified: new Date(updated_at),
  }));

  const toRoutes = (base: string, rows: typeof slugs): MetadataRoute.Sitemap =>
    rows.map(({ slug, updated_at }) => ({
      url: `${SITE_URL}${base}/${slug}`,
      lastModified: new Date(updated_at),
    }));

  return [
    ...staticRoutes,
    ...listingRoutes,
    ...toRoutes("/seasonal", seasonalSlugs),
    ...toRoutes("/for-sale", saleSlugs),
  ];
}
