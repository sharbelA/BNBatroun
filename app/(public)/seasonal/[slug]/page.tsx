import type { Metadata } from "next";
import PropertyDetail, { propertyMetadata } from "@/components/listing/PropertyDetail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return propertyMetadata("seasonal", (await params).slug);
}

export default async function Page({ params }: Props) {
  return <PropertyDetail type="seasonal" slug={(await params).slug} />;
}
