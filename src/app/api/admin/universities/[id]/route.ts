import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { universities, universityPrograms, users } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await context.params;
    const uniId = parseInt(id);
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

    await db.update(universities).set({
      nameRu, nameKz, nameEn,
      cityRu, cityKz, cityEn,
      descriptionRu, descriptionKz, descriptionEn,
      logoUrl,
    }).where(eq(universities.id, uniId));

    // Update programs
    if (programs && Array.isArray(programs)) {
      await db.delete(universityPrograms).where(eq(universityPrograms.universityId, uniId));
      if (programs.length > 0) {
        const programsToInsert = programs.map((p: any) => ({
          universityId: uniId,
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin universities PUT error:", error);
    return NextResponse.json({ error: "Failed to update university" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { id } = await context.params;
    const uniId = parseInt(id);

    await db.delete(universities).where(eq(universities.id, uniId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin universities DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete university" }, { status: 500 });
  }
}
