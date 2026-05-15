import { db } from "@/db";
import { universities, universityPrograms } from "@/db/schema";
import { eq, desc, ilike, or, inArray, sql, type InferSelectModel } from "drizzle-orm";
import { University, CreateUniversityDTO, UpdateUniversityDTO } from "@/domain/universities/types";

type UniversityRow = InferSelectModel<typeof universities>;
type ProgramRow = InferSelectModel<typeof universityPrograms>;

export class UniversitiesRepository {
  async findAll(page: number = 1, pageSize: number = 100, search?: string): Promise<{ universities: University[]; total: number }> {
    let whereClause: any = undefined;

    if (search) {
      whereClause = or(
        ilike(universities.nameRu, `%${search}%`),
        ilike(universities.nameKz, `%${search}%`),
        ilike(universities.nameEn, `%${search}%`),
        ilike(universities.cityRu, `%${search}%`)
      );
    }

    const offset = (page - 1) * pageSize;

    const results = await db
      .select()
      .from(universities)
      .where(whereClause)
      .orderBy(desc(universities.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(universities)
      .where(whereClause);

    const allUniversities = await Promise.all(
      results.map(async (uni: UniversityRow) => {
        const programs = await db
          .select()
          .from(universityPrograms)
          .where(eq(universityPrograms.universityId, uni.id));
        return { ...uni, programs: programs as ProgramRow[] };
      })
    );

    return { 
      universities: allUniversities as University[],
      total: Number(count)
    };
  }

  async findById(id: number): Promise<University | null> {
    const [uni] = await db.select().from(universities).where(eq(universities.id, id)).limit(1);
    if (!uni) return null;

    const programs = await db
      .select()
      .from(universityPrograms)
      .where(eq(universityPrograms.universityId, uni.id));

    return { ...uni, programs: programs as ProgramRow[] } as University;
  }

  async create(data: CreateUniversityDTO): Promise<University> {
    return await db.transaction(async (tx: any) => {
      const [newUni] = await tx
        .insert(universities)
        .values({
          nameRu: data.nameRu,
          nameKz: data.nameKz,
          nameEn: data.nameEn,
          cityRu: data.cityRu,
          cityKz: data.cityKz,
          cityEn: data.cityEn,
          descriptionRu: data.descriptionRu || null,
          descriptionKz: data.descriptionKz || null,
          descriptionEn: data.descriptionEn || null,
          logoUrl: data.logoUrl || null,
        })
        .returning();

      let insertedPrograms: ProgramRow[] = [];
      if (data.programs && data.programs.length > 0) {
        const programsToInsert = data.programs.map((p) => ({
          universityId: newUni.id,
          nameRu: p.nameRu || "",
          nameKz: p.nameKz || "",
          nameEn: p.nameEn || "",
          passingScore: p.passingScore || 0,
          descriptionRu: p.descriptionRu || null,
          descriptionKz: p.descriptionKz || null,
          descriptionEn: p.descriptionEn || null,
        }));
        insertedPrograms = (await tx.insert(universityPrograms).values(programsToInsert).returning()) as ProgramRow[];
      }

      return { ...newUni, programs: insertedPrograms } as unknown as University;
    });
  }

  async update(id: number, data: UpdateUniversityDTO): Promise<University | null> {
    return await db.transaction(async (tx: any) => {
      // 1. Update university
      const { programs, ...uniData } = data;
      
      let updatedUni: UniversityRow | undefined;
      if (Object.keys(uniData).length > 0) {
        const [updated] = await tx
          .update(universities)
          .set(uniData)
          .where(eq(universities.id, id))
          .returning();
        updatedUni = updated as UniversityRow;
      } else {
        const [existing] = await tx.select().from(universities).where(eq(universities.id, id)).limit(1);
        updatedUni = existing as UniversityRow;
      }

      if (!updatedUni) return null;

      // 2. Update programs (For simplicity, we delete all existing and re-insert if programs array is provided)
      let currentPrograms: ProgramRow[] = [];
      if (programs) {
        await tx.delete(universityPrograms).where(eq(universityPrograms.universityId, id));

        if (programs.length > 0) {
          const programsToInsert = programs.map((p) => ({
            universityId: id,
            nameRu: p.nameRu || "",
            nameKz: p.nameKz || "",
            nameEn: p.nameEn || "",
            passingScore: p.passingScore || 0,
            descriptionRu: p.descriptionRu || null,
            descriptionKz: p.descriptionKz || null,
            descriptionEn: p.descriptionEn || null,
          }));
          currentPrograms = (await tx.insert(universityPrograms).values(programsToInsert).returning()) as ProgramRow[];
        }
      } else {
        currentPrograms = (await tx.select().from(universityPrograms).where(eq(universityPrograms.universityId, id))) as ProgramRow[];
      }

      return { ...updatedUni, programs: currentPrograms } as unknown as University;
    });
  }

  async delete(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(universities)
      .where(eq(universities.id, id))
      .returning({ id: universities.id });
    
    return !!deleted;
  }

  async bulkDelete(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    const deleted = await db
      .delete(universities)
      .where(inArray(universities.id, ids))
      .returning({ id: universities.id });
    return deleted.length;
  }
}

