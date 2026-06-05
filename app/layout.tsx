import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manzeli — Chalets & Vacation Rentals in Lebanon",
  description:
    "Find and book the best chalets, villas, and vacation homes across Lebanon. From Batroun beachfront to mountain retreats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
