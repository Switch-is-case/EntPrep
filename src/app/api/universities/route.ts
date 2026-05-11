import { NextResponse } from "next/server";
import { db } from "@/db";
import { universities, universityPrograms, subjectCombinations } from "@/db/schema";
import { eq, like, and, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const comboId = searchParams.get("comboId");

    const data = await db.query.universities.findMany({
      where: (u, { and, eq, or, like }) => {
        const filters = [];
        if (city) filters.push(or(eq(u.cityRu, city), eq(u.cityKz, city), eq(u.cityEn, city)));
        if (search) filters.push(or(like(u.nameRu, `%${search}%`), like(u.nameKz, `%${search}%`), like(u.nameEn, `%${search}%`)));
        return filters.length > 0 ? and(...filters) : undefined;
      },
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
              orderBy: (s, { desc }) => [desc(s.year)],
              limit: 1,
            }
          }
        }
      },
      orderBy: (u, { asc }) => [asc(u.nameRu)],
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Universities API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
