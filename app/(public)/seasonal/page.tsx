import type { Metadata } from "next";
import PropertyBrowse from "@/components/listing/PropertyBrowse";

export const metadata: Metadata = {
  title: "Seasonal rentals in Batroun",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <PropertyBrowse type="seasonal" params={await searchParams} />;
}
