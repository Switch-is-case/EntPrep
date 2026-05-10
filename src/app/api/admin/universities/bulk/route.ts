import { AppError } from "@/lib/errors";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { universities, universityPrograms, users } from "@/db/schema";
import { getUserIdFromRequest } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { error: "Invalid format. Expected a non-empty array of universities." },
        { status: 400 }
      );
    }

    // 1. Валидация всех элементов перед вставкой
    const validationErrors: string[] = [];
    for (let i = 0; i < body.length; i++) {
      const item = body[i];
      if (!item.nameRu || !item.nameKz || !item.nameEn || !item.cityRu || !item.cityKz || !item.cityEn) {
        validationErrors.push(`Item #${i + 1}: University names and cities in all languages are required.`);
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    // 2. ✅ Один INSERT для всех университетов вместо N INSERT-ов
    const uniRows = body.map((item: any) => ({
      nameRu: item.nameRu,
      nameKz: item.nameKz,
      nameEn: item.nameEn,
      cityRu: item.cityRu,
      cityKz: item.cityKz,
      cityEn: item.cityEn,
      descriptionRu: item.descriptionRu || null,
      descriptionKz: item.descriptionKz || null,
      descriptionEn: item.descriptionEn || null,
      logoUrl: item.logoUrl || null,
    }));

    const insertedUnis = await db.insert(universities).values(uniRows).returning();

    // 3. ✅ Один INSERT для всех программ вместо N INSERT-ов
    const allProgramRows = insertedUnis.flatMap((uni: any, idx: number) => {
      const item = body[idx];
      if (!item.programs || !Array.isArray(item.programs) || item.programs.length === 0) return [];
      return item.programs.map((p: any) => ({
        universityId: uni.id,
        nameRu: p.nameRu || "",
        nameKz: p.nameKz || "",
        nameEn: p.nameEn || "",
        passingScore: parseInt(p.passingScore) || 0,
        descriptionRu: p.descriptionRu || "",
        descriptionKz: p.descriptionKz || "",
        descriptionEn: p.descriptionEn || "",
      }));
    });

    if (allProgramRows.length > 0) {
      await db.insert(universityPrograms).values(allProgramRows);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedUnis.length} universities with ${allProgramRows.length} programs.`,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Admin universities bulk import error:", error);
    return NextResponse.json({ error: "Failed to process bulk import." }, { status: 500 });
  }
}
