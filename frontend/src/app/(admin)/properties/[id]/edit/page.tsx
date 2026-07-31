"use client";

import { use } from "react";
import { ListingEditorPanel } from "@/features/properties/editor";

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ListingEditorPanel propertyId={id} />;
}
