import { PropertyDetailPanel } from "@/features/properties/detail/PropertyDetailPanel";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PropertyDetailPanel propertyId={id} />;
}
