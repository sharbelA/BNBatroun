import { Header, Footer } from "@/components/layout";
import { Container } from "@/components/ui";
import { getListingBySlug } from "@/lib/supabase/queries/listings";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) notFound();

  return (
    <>
      <Header />
      <main className="flex-1">
        <Container className="py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] mb-6"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to listings
          </Link>
          <div className="bg-[var(--surface)] rounded-2xl p-12 text-center">
            <h1 className="text-2xl font-semibold mb-2">{listing.title}</h1>
            <p className="text-[var(--muted)]">
              Listing detail page — coming in Phase 1, Day 6.
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
