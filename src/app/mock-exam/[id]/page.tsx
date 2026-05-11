import React from "react";
import { MockExamInterface } from "@/components/MockExamInterface";

export default async function MockExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="min-h-screen">
      <MockExamInterface sessionId={id} />
    </main>
  );
}
