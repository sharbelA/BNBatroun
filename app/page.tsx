import { Header, Footer } from "@/components/layout";
import { Hero } from "@/components/home";
import { ListingGrid } from "@/components/listing";
import { getListings } from "@/lib/supabase/queries/listings";

export default async function Home() {
  const featured = await getListings({ featured: true });
  const all = await getListings();

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <ListingGrid listings={featured} title="Guest favourites in Lebanon" />
        <ListingGrid listings={all} title="Explore all stays" />
      </main>
      <Footer />
    </>
  );
}
