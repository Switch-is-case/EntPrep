import React from "react";
import { MockExamInterface } from "@/components/MockExamInterface";

export default function MockExamPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen">
      <MockExamInterface sessionId={params.id} />
    </main>
  );
}
