import { NextResponse } from "next/server";
import { db } from "@/db";
import { universities, universityPrograms, programScoreHistory } from "@/db/schema";
import { eq, like, and, or, asc, desc, SQL } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const comboId = searchParams.get("comboId");

    const filters: SQL[] = [];
    if (city) {
      filters.push(or(eq(universities.cityRu, city), eq(universities.cityKz, city), eq(universities.cityEn, city))!);
    }
    if (search) {
      filters.push(or(like(universities.nameRu, `%${search}%`), like(universities.nameKz, `%${search}%`), like(universities.nameEn, `%${search}%`))!);
    }

    const data = await db.query.universities.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      with: {
        programs: {
          where: comboId ? eq(universityPrograms.combinationId, parseInt(comboId)) : undefined,
          with: {
            combination: {
              with: {
                subject1: true,
                subject2: true,
              }
            },
            scoreHistory: {
              orderBy: [desc(programScoreHistory.year)],
              limit: 1,
            }
          }
        }
      },
      orderBy: [asc(universities.nameRu)],
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Universities API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
