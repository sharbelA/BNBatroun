import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BNBatroun — Chalets in Batroun, Lebanon",
  description:
    "Discover and book unique chalets in Batroun. Local, trusted, community-driven.",
  openGraph: {
    title: "BNBatroun — Chalets in Batroun, Lebanon",
    description:
      "Discover and book unique chalets in Batroun. Local, trusted, community-driven.",
    siteName: "BNBatroun",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
