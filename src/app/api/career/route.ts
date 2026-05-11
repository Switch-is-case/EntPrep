import { NextResponse } from "next/server";
import { db } from "@/db";
import { entDirections, specialties, subjectCombinations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // directions | specialties | combinations

    if (type === "directions") {
      const data = await db.query.entDirections.findMany({
        with: {
          specialties: true,
        },
        orderBy: (d, { asc }) => [asc(d.nameRu)],
      });
      return NextResponse.json(data);
    }

    if (type === "combinations") {
      const data = await db.query.subjectCombinations.findMany({
        where: eq(subjectCombinations.isActive, true),
        with: {
          subject1: true,
          subject2: true,
        },
      });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Career API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
