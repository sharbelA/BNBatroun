import { Header, Footer } from "@/components/layout";
import { Container } from "@/components/ui";

export default function ChaletsLoading() {
  return (
    <>
      <Header />
      <main className="flex-1 shimmer">
        <Container className="py-12 md:py-16">
          <div className="mb-8 h-9 w-64 rounded bg-gray-200" />
          <div className="mb-10 h-48 rounded-2xl border border-gray-100 bg-gray-50" />
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[20/19] mb-3 rounded-xl bg-gray-200" />
                <div className="mb-2 h-4 w-40 rounded bg-gray-200" />
                <div className="mb-2 h-3 w-28 rounded bg-gray-100" />
                <div className="mt-2 h-4 w-20 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
