/**
 * PropertyDetail — detail page body for seasonal rentals and properties for sale.
 * No calendar or booking flow: the call to action is a WhatsApp enquiry.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Container, Icon, ScrollToTop } from "@/components/ui";
import PhotoGallery from "@/app/(public)/chalets/[slug]/_components/PhotoGallery";
import ExpandableText from "@/app/(public)/chalets/[slug]/_components/ExpandableText";
import { getPropertyFull } from "@/lib/supabase/queries/listings";
import { getCurrentUser } from "@/app/_actions/auth";
import { PRICE_PERIODS, PROPERTY_KINDS, SITE } from "@/lib/constants";

type PropertyType = "seasonal" | "sale";

const AMENITIES = [
  { key: "wifi", label: "WiFi", icon: "wifi" },
  { key: "pool", label: "Pool", icon: "pool" },
  { key: "parking", label: "Parking", icon: "parking" },
  { key: "ac", label: "Air conditioning", icon: "ac" },
  { key: "bbq", label: "BBQ", icon: "bbq" },
  { key: "pet_friendly", label: "Pets allowed", icon: "paw" },
  { key: "sea_view", label: "Sea view", icon: "waves" },
  { key: "mountain_view", label: "Mountain view", icon: "mountain" },
] as const;

export async function propertyMetadata(type: PropertyType, slug: string): Promise<Metadata> {
  const data = await getPropertyFull(type, slug);
  if (!data) return { title: "Not Found" };
  const { listing } = data;
  const description = listing.description.slice(0, 160);
  const label = type === "sale" ? "For sale" : "Seasonal rental";
  return {
    title: `${listing.title} — ${label} in ${listing.location} | BNBatroun`,
    description,
    openGraph: {
      title: listing.title,
      description,
      images: data.images[0] ? [{ url: data.images[0].url, width: 1200, height: 800 }] : [],
      type: "website",
    },
  };
}

function priceParts(
  type: PropertyType,
  price: number,
  period: string | null
): { amount: string; suffix: string } {
  const amount = `${SITE.currencySymbol}${price.toLocaleString("en-US")}`;
  if (type === "sale") return { amount, suffix: "" };
  const label = PRICE_PERIODS.find((p) => p.value === period)?.label ?? "per month";
  return { amount, suffix: label.replace("per ", "/ ") };
}

export default async function PropertyDetail({
  type,
  slug,
}: {
  type: PropertyType;
  slug: string;
}) {
  const data = await getPropertyFull(type, slug);
  if (!data) notFound();

  const { listing, images } = data;
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";
  const kind = PROPERTY_KINDS.find((k) => k.value === listing.property_kind)?.label;
  const { amount, suffix } = priceParts(type, listing.price, listing.price_period);
  const amenities = AMENITIES.filter(({ key }) => listing[key]);

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const message = encodeURIComponent(
    type === "sale"
      ? `Hi, I'm interested in the property "${listing.title}" (${amount}) listed on BNBatroun. Is it still available?`
      : `Hi, I'd like to rent "${listing.title}" (${amount} ${suffix}) listed on BNBatroun. Is it available this season?`
  );
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${message}` : null;

  const facts: { icon: Parameters<typeof Icon>[0]["name"]; text: string }[] = [
    { icon: "mapPin", text: listing.location },
    { icon: "bed", text: `${listing.bedrooms} bedroom${listing.bedrooms !== 1 ? "s" : ""}` },
    { icon: "bath", text: `${listing.bathrooms} bathroom${listing.bathrooms !== 1 ? "s" : ""}` },
  ];

  const cta = (
    <a
      href={waUrl ?? "#"}
      target={waUrl ? "_blank" : undefined}
      rel="noopener noreferrer"
      aria-disabled={!waUrl}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${
        waUrl
          ? "bg-[#25D366] text-white hover:opacity-90 active:scale-[0.98]"
          : "cursor-not-allowed bg-sand-100 text-warm-400"
      }`}
    >
      <Icon name="whatsapp" size={18} fill={waUrl ? "white" : "currentColor"} />
      {waUrl ? (type === "sale" ? "Enquire on WhatsApp" : "Ask about availability") : "Contact us"}
    </a>
  );

  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="flex-1 pb-28 lg:pb-0">
        <div className="mt-4">
          <Container>
            <PhotoGallery images={images} title={listing.title} />
          </Container>
        </div>

        <Container>
          <div className="mt-10 flex flex-col gap-12 lg:flex-row lg:gap-20">
            <div className="min-w-0 flex-1">
              <section>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[var(--accent)]/20 bg-[var(--accent-light)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                    {type === "sale" ? (kind ?? "For sale") : "Seasonal rental"}
                  </span>
                  {type === "sale" && (
                    <span className="rounded-full bg-sand-100 px-3 py-1 text-xs font-semibold text-warm-600">
                      For sale
                    </span>
                  )}
                </div>
                <h1 className="mt-3 break-words text-2xl leading-tight sm:text-3xl md:text-4xl">
                  {listing.title}
                </h1>
                {isAdmin && listing.internal_name && (
                  <span className="mt-1 inline-flex items-center gap-1 rounded bg-warm-100 px-2 py-0.5 text-xs font-medium text-warm-500">
                    🔒 {listing.internal_name}
                  </span>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--muted)]">
                  {facts.map((f, i) => (
                    <span key={f.text} className="flex items-center gap-1">
                      {i > 0 && <span className="mr-2">·</span>}
                      <Icon name={f.icon} size={14} />
                      {f.text}
                    </span>
                  ))}
                  {listing.area_sqm && (
                    <span className="flex items-center gap-1">
                      <span className="mr-2">·</span>
                      {listing.area_sqm} m²
                    </span>
                  )}
                </div>
              </section>

              <Divider />
              <section>
                <h2 className="mb-4 text-xl md:text-2xl">
                  {type === "sale" ? "About this property" : "About this rental"}
                </h2>
                <ExpandableText text={listing.description} />
              </section>

              {amenities.length > 0 && (
                <>
                  <Divider />
                  <section>
                    <h2 className="mb-5 text-xl md:text-2xl">Features</h2>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {amenities.map(({ key, label, icon }) => (
                        <div key={key} className="flex items-center gap-3 rounded-xl bg-sand-50 px-3 py-2.5">
                          <span className="text-[var(--accent)]">
                            <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={20} />
                          </span>
                          <span className="text-sm">{label}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {listing.latitude && listing.longitude && (
                <>
                  <Divider />
                  <section>
                    <h2 className="mb-5 text-xl md:text-2xl">Location</h2>
                    <div className="h-64 overflow-hidden rounded-2xl border border-[var(--border-light)] sm:h-72">
                      <iframe
                        title="Property location"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${listing.latitude},${listing.longitude}&z=15&output=embed`}
                      />
                    </div>
                  </section>
                </>
              )}
              <div className="h-10" />
            </div>

            {/* Desktop sticky card */}
            <div className="hidden w-[360px] shrink-0 lg:block">
              <div className="sticky top-[calc(var(--header-height)+24px)] rounded-2xl border border-[var(--border-light)] bg-white p-6 shadow-sm">
                <p className="text-sm text-[var(--muted)]">{type === "sale" ? "Asking price" : "Rent"}</p>
                <p className="mt-1 text-3xl font-semibold text-[var(--foreground)]">
                  {amount} <span className="text-base font-normal text-[var(--muted)]">{suffix}</span>
                </p>
                <div className="mt-5">{cta}</div>
                <p className="mt-3 text-center text-xs text-[var(--muted)]">
                  {type === "sale"
                    ? "Contact us to arrange a viewing."
                    : "Contact us to confirm dates and terms."}
                </p>
              </div>
            </div>
          </div>
        </Container>

        {/* Mobile / tablet sticky bar */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border-light)] bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="shrink-0">
              <p className="text-base font-semibold leading-tight text-[var(--foreground)]">{amount}</p>
              {suffix && <p className="text-xs text-[var(--muted)]">{suffix}</p>}
            </div>
            <div className="flex-1">{cta}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Divider() {
  return <hr className="my-10 border-[var(--border-light)] md:my-12" />;
}
