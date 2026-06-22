import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Container, Icon, ScrollToTop } from "@/components/ui";
import { getListingFull } from "@/lib/supabase/queries/listings";
import PhotoGallery from "./_components/PhotoGallery";
import BookingCard from "./_components/BookingCard";
import AvailabilityCalendar from "@/components/calendar/AvailabilityCalendar";
import ExpandableTextClient from "./_components/ExpandableText";
import MobileBookingBar from "./_components/MobileBookingBar";
import ReviewSection from "./_components/ReviewSection";

// ─── Metadata ────────────────────────────────────────────────

export async function generateMetadata(
  props: PageProps<"/chalets/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const data = await getListingFull(slug);
  if (!data) return { title: "Not Found" };

  const { listing } = data;
  const description = listing.description.slice(0, 160);

  return {
    title: `${listing.title} — ${listing.bedrooms}BR in Batroun | BNBatroun`,
    description,
    openGraph: {
      title: listing.title,
      description,
      images: data.images[0]
        ? [{ url: data.images[0].url, width: 1200, height: 800 }]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description,
      images: data.images[0] ? [data.images[0].url] : [],
    },
  };
}

// ─── Page ────────────────────────────────────────────────────

export default async function ChaletDetailPage(
  props: PageProps<"/chalets/[slug]">
) {
  const { slug } = await props.params;
  const data = await getListingFull(slug);

  if (!data || !data.listing.is_active) notFound();

  const { listing, images, rooms, availability } = data;

  const amenities: { key: keyof typeof AMENITY_MAP; label: string }[] = (
    Object.keys(AMENITY_MAP) as (keyof typeof AMENITY_MAP)[]
  )
    .filter((key) => listing[key])
    .map((key) => ({ key, label: AMENITY_MAP[key].label }));

  return (
    <>
      <ScrollToTop />
      <Header />
      <main className="flex-1 pb-24 md:pb-0">
        {/* ── Photo Gallery ─────────────────────────────── */}
        <div className="mt-4">
          <Container>
            <PhotoGallery images={images} title={listing.title} />
          </Container>
        </div>

        <Container>
          <div className="mt-10 flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* ── Left column ────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* ── Listing Header ── */}
              <section>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl leading-tight break-words">
                      {listing.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[var(--muted)] text-sm">
                      <span className="flex items-center gap-1">
                        <Icon name="mapPin" size={14} />
                        {listing.location}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Icon name="bed" size={14} />
                        {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? "s" : ""}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Icon name="bath" size={14} />
                        {listing.bathrooms} bathroom{listing.bathrooms !== 1 ? "s" : ""}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Icon name="users" size={14} />
                        Up to {listing.max_guests} guests
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 bg-[var(--accent-light)] text-[var(--accent)] text-xs font-semibold px-3 py-1.5 rounded-full border border-[var(--accent)]/20 whitespace-nowrap">
                    Managed by BNBatroun
                  </div>
                </div>
              </section>

              <Divider />

             
              {/* ── Description ── */}
              <section>
                <h2 className="text-xl md:text-2xl mb-4">About this place</h2>
                <ExpandableText text={listing.description} />
              </section>

              {/* ── Sleeping Arrangements ── */}
              {rooms.length > 0 && (
                <>
                  <Divider />
                  <section>
                    <h2 className="text-xl md:text-2xl mb-5">
                      Sleeping arrangements
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1">
                      {rooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex-none w-44 border border-[var(--border-light)] rounded-xl p-4 bg-[var(--surface)]"
                        >
                          <div className="mb-2">
                            <Icon name="bed" size={20} className="text-[var(--accent)]" />
                          </div>
                          <p className="font-semibold text-sm leading-tight">{room.name}</p>
                          <p className="text-xs text-[var(--muted)] mt-0.5">
                            {room.beds} {room.beds === 1 ? "bed" : "beds"}
                          </p>
                          {room.view_description && (
                            <p className="text-xs text-[var(--muted)] mt-1 leading-snug">
                              {room.view_description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}

              {/* ── Amenities ── */}
              {amenities.length > 0 && (
                <>
                  <Divider />
                  <section>
                    <h2 className="text-xl md:text-2xl mb-5">
                      What this place offers
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {amenities.map(({ key, label }) => {
                        const { icon } = AMENITY_MAP[key];
                        return (
                          <div key={key} className="flex items-center gap-3 rounded-xl bg-sand-50 px-3 py-2.5">
                            <span className="text-[var(--accent)]">
                              <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={20} />
                            </span>
                            <span className="text-sm">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}

              {/* ── House Rules ── */}
              {listing.house_rules?.length > 0 && (
                <>
                  <Divider />
                  <section>
                    <h2 className="text-xl md:text-2xl mb-5">House rules</h2>
                    <ul className="space-y-3">
                      {listing.house_rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <span className="mt-0.5 shrink-0 text-[var(--accent)]">
                            <Icon name="check" size={16} />
                          </span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </section>
                </>
              )}

              {/* ── Availability Calendar ── */}
              <Divider />
              <section>
                <h2 className="text-xl md:text-2xl mb-1">Availability</h2>
                <p className="text-sm text-[var(--muted)] mb-5">
                  {availability.length > 0
                    ? "Select your dates to see pricing."
                    : "Contact us to confirm your preferred dates."}
                </p>
                <AvailabilityCalendar
                  listingId={listing.id}
                  initialAvailability={availability}
                  mode="readonly"
                />
              </section>

              {/* ── Reviews ── */}
              <Divider />
              <ReviewSection listingId={listing.id} listingSlug={listing.slug} />

              {/* ── Google Maps ── */}
              {listing.latitude && listing.longitude && (
                <>
                  <Divider />
                  <section>
                    <h2 className="text-xl md:text-2xl mb-5">Location</h2>
                    <div className="rounded-2xl overflow-hidden border border-[var(--border-light)] h-72">
                      <iframe
                        title="Chalet location"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${listing.latitude},${listing.longitude}&z=15&output=embed`}
                      />
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[var(--accent)] hover:underline"
                    >
                      <Icon name="externalLink" size={14} />
                      Open in Google Maps
                    </a>
                  </section>
                </>
              )}

              <div className="h-10" />
            </div>

            {/* ── Sticky Booking Card — desktop ──────── */}
            <div className="hidden lg:block w-[360px] shrink-0">
              <div className="sticky top-[calc(var(--header-height)+24px)]">
                <BookingCard
                  price={listing.price}
                  weekendPrice={listing.weekend_price ?? listing.price}
                  maxGuests={listing.max_guests}
                  title={listing.title}
                  slug={listing.slug}
                  availability={availability}
                />
              </div>
            </div>
          </div>
        </Container>

        {/* ── Mobile booking bar ─────────────────────── */}
        <MobileBookingBar
          price={listing.price}
          weekendPrice={listing.weekend_price ?? listing.price}
          maxGuests={listing.max_guests}
          title={listing.title}
          slug={listing.slug}
          availability={availability}
        />
      </main>
      <Footer />
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function Divider() {
  return <hr className="my-10 md:my-12 border-[var(--border-light)]" />;
}

function ExpandableText({ text }: { text: string }) {
  return <ExpandableTextClient text={text} />;
}

// ─── Amenity config ──────────────────────────────────────────

const AMENITY_MAP = {
  wifi: { label: "WiFi", icon: "wifi" },
  pool: { label: "Private pool", icon: "pool" },
  parking: { label: "Free parking", icon: "parking" },
  ac: { label: "Air conditioning", icon: "ac" },
  bbq: { label: "BBQ grill", icon: "bbq" },
  pet_friendly: { label: "Pets allowed", icon: "paw" },
  sea_view: { label: "Sea view", icon: "waves" },
  mountain_view: { label: "Mountain view", icon: "mountain" },
} as const satisfies Record<
  | "wifi"
  | "pool"
  | "parking"
  | "ac"
  | "bbq"
  | "pet_friendly"
  | "sea_view"
  | "mountain_view",
  { label: string; icon: string }
>;
