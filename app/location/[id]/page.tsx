import { catalog } from "@/lib/api";

import LocationView from "./LocationView";

export const dynamicParams = false;

export function generateStaticParams() {
  return catalog.map((location) => ({ id: location.id }));
}

export default async function LocationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LocationView id={id} />;
}
