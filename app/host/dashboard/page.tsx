import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/app/_actions/auth";
import { getHostListings } from "@/lib/supabase/queries/listings";
import { Icon } from "@/components/ui";

export const metadata: Metadata = { title: "Host dashboard" };

export default async function HostDashboardPage() {
  const user = await getCurrentUser();
  const listings = user ? await getHostListings(user.id) : [];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 md:px-6 md:py-16">
      {/* Header */}
      <div
        style={{
          marginBottom: "32px",
          paddingBottom: "24px",
          borderBottom: "1px solid var(--border-light, #ebebeb)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "var(--foreground)",
            marginBottom: "6px",
          }}
        >
          Your chalets
        </h1>
        <p style={{ fontSize: "14px", color: "var(--muted)" }}>
          Manage availability for the chalets assigned to you.
        </p>
      </div>

      {listings.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            borderRadius: "20px",
            border: "1px dashed var(--border, #ddd)",
            background: "var(--surface, #f7f7f7)",
            padding: "80px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "var(--accent-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "4px",
            }}
          >
            <Icon name="bed" size={24} />
          </div>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--foreground)" }}>
            No chalets yet
          </p>
          <p style={{ fontSize: "14px", color: "var(--muted)", maxWidth: "280px" }}>
            Contact the Manzeli team to get your chalet listed on the platform.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <div
              key={listing.id}
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRadius: "20px",
                border: "1px solid var(--border-light, #ebebeb)",
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}
              className="hover:shadow-lg hover:-translate-y-0.5"
            >
              {/* Cover image */}
              <div className="relative aspect-[4/3] w-full" style={{ background: "var(--surface)" }}>
                {listing.cover_image ? (
                  <Image
                    src={listing.cover_image}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--border)",
                    }}
                  >
                    <Icon name="bed" size={32} />
                  </div>
                )}
              </div>

              {/* Card body */}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "var(--foreground)",
                  }}
                >
                  {listing.title}
                </h2>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "13px",
                    color: "var(--muted)",
                  }}
                >
                  <Icon name="mapPin" size={13} />
                  {listing.location}
                </p>

                <Link
                  href={`/host/chalets/${listing.id}/availability`}
                  className="hover:opacity-90"
                  style={{
                    marginTop: "16px",
                    display: "inline-flex",
                    height: "42px",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    borderRadius: "12px",
                    backgroundColor: "var(--accent)",
                    padding: "0 20px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#fff",
                    textDecoration: "none",
                    transition: "opacity 0.15s",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 7h12"/><path d="M5 1v4"/><path d="M11 1v4"/></svg>
                  Manage availability
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
