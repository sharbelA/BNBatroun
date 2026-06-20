import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { Container } from "@/components/ui";

export default function ChaletNotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-24">
        <Container>
          <div className="mx-auto max-w-md text-center">
            <p className="text-5xl mb-6">🏡</p>
            <h1 className="text-2xl font-semibold text-warm-900 mb-3">
              Chalet not found
            </h1>
            <p className="text-[var(--muted)] mb-8 leading-relaxed">
              This chalet may have been removed, renamed, or isn&apos;t available
              right now.
            </p>
            <Link
              href="/chalets"
              className="inline-flex h-11 items-center rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Browse all chalets
            </Link>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
