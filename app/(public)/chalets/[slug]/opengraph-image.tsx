import { ImageResponse } from "next/og";
import { getListingFull } from "@/lib/supabase/queries/listings";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Manzeli chalet listing";

export default async function Image(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const data = await getListingFull(slug);

  const title = data?.listing.title ?? "Chalet in Batroun";
  const location = data?.listing.location ?? "Batroun, Lebanon";
  const price = data?.listing.price;
  const photo = data?.images[0]?.url;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          backgroundColor: "#f4ede3",
          fontFamily: "sans-serif",
        }}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(28,20,14,0.85) 0%, rgba(28,20,14,0.25) 55%, rgba(28,20,14,0) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "56px 64px",
            color: "white",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28, opacity: 0.9 }}>{location}</span>
          <span style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            {price !== undefined && (
              <span style={{ fontSize: 36, fontWeight: 600 }}>
                ${price}
              </span>
            )}
            {price !== undefined && (
              <span style={{ fontSize: 22, opacity: 0.85 }}>/ night</span>
            )}
            <span style={{ fontSize: 22, opacity: 0.7, marginLeft: 16 }}>
              Manzeli
            </span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
