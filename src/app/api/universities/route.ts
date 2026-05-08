import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { universities, universityPrograms } from "@/db/schema";
import { eq, desc, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  try {
    let query = db.select().from(universities);
    
    if (search) {
      query = query.where(
        or(
          ilike(universities.nameRu, `%${search}%`),
          ilike(universities.nameKz, `%${search}%`),
          ilike(universities.nameEn, `%${search}%`),
          ilike(universities.cityRu, `%${search}%`)
        )
      ) as typeof query;
    }

    const results = await query.orderBy(desc(universities.createdAt));

    // Fetch programs for these universities
    const allUniversities = await Promise.all(
      results.map(async (uni) => {
        const programs = await db
          .select()
          .from(universityPrograms)
          .where(eq(universityPrograms.universityId, uni.id));
        return { ...uni, programs };
      })
    );

    return NextResponse.json({ universities: allUniversities });
  } catch (error) {
    console.error("Public universities GET error:", error);
    return NextResponse.json({ error: "Failed to load universities" }, { status: 500 });
  }
}
