import { NextRequest } from "next/server";
import { db } from "@/db";
import { universities, universityPrograms } from "@/db/schema";
import { requireAdmin, createAdminResponse, createErrorResponse } from "@/lib/auth-checks";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin(request);

    const { allowed } = await checkRateLimit(admin.userId, "ADMIN_BULK");
    if (!allowed) return createErrorResponse("Too many requests", 429);

    const body = await request.json();

    if (!Array.isArray(body) || body.length === 0) {
      return createErrorResponse("Invalid format. Expected a non-empty array of universities.", 400);
    }

    const validationErrors: string[] = [];
    for (let i = 0; i < body.length; i++) {
      const item = body[i];
      if (!item.nameRu || !item.nameKz || !item.nameEn || !item.cityRu || !item.cityKz || !item.cityEn) {
        validationErrors.push(`Item #${i + 1}: University names and cities in all languages are required.`);
      }
    }

    if (validationErrors.length > 0) {
      return createErrorResponse("Validation failed", 400);
    }

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

    return createAdminResponse({
      success: true,
      message: `Successfully imported ${insertedUnis.length} universities with ${allProgramRows.length} programs.`,
    });
  } catch (error: unknown) {
    if (error instanceof Response) return error;
    console.error("Admin universities bulk import error:", error);
    return createErrorResponse("Failed to process bulk import.", 500);
  }
}
