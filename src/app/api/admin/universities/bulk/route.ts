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

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid format. Expected an array of universities." },
        { status: 400 }
      );
    }

    let importedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < body.length; i++) {
      const item = body[i];
      try {
        if (!item.nameRu || !item.nameKz || !item.nameEn || !item.cityRu || !item.cityKz || !item.cityEn) {
          throw new Error(`University names and cities in all languages are required.`);
        }

        const [newUni] = await db.insert(universities).values({
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
        }).returning();

        if (item.programs && Array.isArray(item.programs) && item.programs.length > 0) {
          const programsToInsert = item.programs.map((p: any) => ({
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

        importedCount++;
      } catch (err: unknown) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.message, details: err.details },
        { status: err.statusCode }
      );
    }
    console.error("API Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Imported ${importedCount} universities with ${errors.length} errors.`,
          details: errors,
        },
        { status: 207 } // Multi-Status
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${importedCount} universities.`,
    });
  } catch (error) {
    console.error("Admin universities bulk import error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk import." },
      { status: 500 }
    );
  }
}
