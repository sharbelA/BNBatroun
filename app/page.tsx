import { Header, Footer } from "@/components/layout";
import { Hero } from "@/components/home";
import { ListingGrid } from "@/components/listing";
import { getListings } from "@/lib/supabase/queries/listings";

export const revalidate = 60; // Cache for 60 seconds

export default async function Home() {
  const [featured, all] = await Promise.all([
    getListings({ featured: true }),
    getListings(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ListingGrid listings={featured} title="Guest Favourites in Lebanon" />
        <ListingGrid listings={all} title="Explore all stays" bg="sand" />
      </main>
      <Footer />
    </>
  );
}
