import type { MetadataRoute } from "next";
import { getActiveSlugs } from "@/lib/supabase/queries/listings";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://bnbatroun.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getActiveSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    "/",
    "/chalets",
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

  return [...staticRoutes, ...listingRoutes];
}
