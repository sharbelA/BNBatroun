import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manzeli — Chalets in Batroun, Lebanon",
  description:
    "Discover and book unique chalets in Batroun. Local, trusted, community-driven.",
  openGraph: {
    title: "Manzeli — Chalets in Batroun, Lebanon",
    description:
      "Discover and book unique chalets in Batroun. Local, trusted, community-driven.",
    siteName: "Manzeli",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
