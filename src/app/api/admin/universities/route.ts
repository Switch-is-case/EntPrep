import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { universities, universityPrograms, users } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq, desc, ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
    console.error("Admin universities GET error:", error);
    return NextResponse.json({ error: "Failed to load universities" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { 
      nameRu, nameKz, nameEn, 
      cityRu, cityKz, cityEn, 
      descriptionRu, descriptionKz, descriptionEn, 
      logoUrl, programs 
    } = body;

    if (!nameRu || !nameKz || !nameEn || !cityRu || !cityKz || !cityEn) {
      return NextResponse.json({ error: "Names and cities in all languages are required" }, { status: 400 });
    }

    const [newUni] = await db.insert(universities).values({
      nameRu, nameKz, nameEn,
      cityRu, cityKz, cityEn,
      descriptionRu, descriptionKz, descriptionEn,
      logoUrl,
    }).returning();

    if (programs && Array.isArray(programs) && programs.length > 0) {
      const programsToInsert = programs.map((p: any) => ({
        universityId: newUni.id,
        nameRu: p.nameRu || "",
        nameKz: p.nameKz || "",
        nameEn: p.nameEn || "",
        passingScore: parseInt(p.passingScore) || 0,
        descriptionRu: p.descriptionRu || "",
        descriptionKz: p.descriptionKz || "",
        descriptionEn: p.descriptionEn || "",
      }));
      await db.insert(universityPrograms).values(programsToInsert);
    }

    return NextResponse.json({ success: true, university: newUni });
  } catch (error) {
    console.error("Admin universities POST error:", error);
    return NextResponse.json({ error: "Failed to create university" }, { status: 500 });
  }
}
