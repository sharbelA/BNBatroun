import Link from "next/link";

export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          textAlign: "center",
          padding: "1.5rem",
          backgroundColor: "#faf9f7",
          color: "#1c1a18",
        }}
      >
        <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>404</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Page not found
        </h1>
        <p style={{ color: "#9c8e82", marginBottom: "2rem", maxWidth: "360px", lineHeight: 1.6 }}>
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/chalets"
          style={{
            display: "inline-flex",
            alignItems: "center",
            height: "2.75rem",
            padding: "0 1.5rem",
            borderRadius: "0.75rem",
            backgroundColor: "#c8956c",
            color: "white",
            fontWeight: 600,
            fontSize: "0.875rem",
            textDecoration: "none",
          }}
        >
          Browse all chalets
        </Link>
      </body>
    </html>
  );
}
