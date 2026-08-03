"use client";

import { useParams } from "next/navigation";
import { LeadDetailPanel } from "@/features/leads";

export default function AdminLeadDetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  if (!id) {
    return (
      <main className="px-xl py-xl">
        <p className="text-body-md text-error">Missing lead id</p>
      </main>
    );
  }
  return <LeadDetailPanel leadId={id} />;
}
