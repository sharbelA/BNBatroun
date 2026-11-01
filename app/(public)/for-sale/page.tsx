import type { Metadata } from "next";
import PropertyBrowse from "@/components/listing/PropertyBrowse";

export const metadata: Metadata = {
  title: "Properties for sale in Batroun",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return <PropertyBrowse type="sale" params={await searchParams} />;
}
