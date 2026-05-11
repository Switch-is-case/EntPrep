import React from "react";
import { CareerWizard, type Direction, type Combination } from "@/components/CareerWizard";
import { db } from "@/db";
import { entDirections, subjectCombinations } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export default async function CareerPage() {
  // Fetch directions with specialties
  const directionsData = await db.query.entDirections.findMany({
    with: {
      specialties: true,
    },
    orderBy: [asc(entDirections.nameRu)],
  });

  // Fetch active subject combinations
  const combinationsData = await db.query.subjectCombinations.findMany({
    where: eq(subjectCombinations.isActive, true),
    with: {
      subject1: true,
      subject2: true,
    },
    orderBy: [asc(subjectCombinations.id)],
  });

  return (
    <main className="min-h-screen bg-bg">
      <CareerWizard 
        initialDirections={directionsData as Direction[]} 
        initialCombinations={combinationsData as Combination[]} 
      />
    </main>
  );
}
