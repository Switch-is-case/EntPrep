import { db } from "@/db";
import { universities, universityPrograms } from "@/db/schema";
import { eq, desc, ilike, or } from "drizzle-orm";
import { University, CreateUniversityDTO, UpdateUniversityDTO, CreateProgramDTO } from "@/domain/universities/types";

export class UniversitiesRepository {
  async findAll(search?: string): Promise<University[]> {
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

    const allUniversities = await Promise.all(
      results.map(async (uni) => {
        const programs = await db
          .select()
          .from(universityPrograms)
          .where(eq(universityPrograms.universityId, uni.id));
        return { ...uni, programs };
      })
    );

    return allUniversities as University[];
  }

  async findById(id: number): Promise<University | null> {
    const [uni] = await db.select().from(universities).where(eq(universities.id, id)).limit(1);
    if (!uni) return null;

    const programs = await db
      .select()
      .from(universityPrograms)
      .where(eq(universityPrograms.universityId, uni.id));

    return { ...uni, programs } as University;
  }

  async create(data: CreateUniversityDTO): Promise<University> {
    return await db.transaction(async (tx) => {
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

      let insertedPrograms: typeof universityPrograms.$inferSelect[] = [];
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
        insertedPrograms = await tx.insert(universityPrograms).values(programsToInsert).returning();
      }

      return { ...newUni, programs: insertedPrograms } as University;
    });
  }

  async update(id: number, data: UpdateUniversityDTO): Promise<University | null> {
    return await db.transaction(async (tx) => {
      // 1. Update university
      const { programs, ...uniData } = data;
      
      let updatedUni;
      if (Object.keys(uniData).length > 0) {
        const [updated] = await tx
          .update(universities)
          .set(uniData)
          .where(eq(universities.id, id))
          .returning();
        updatedUni = updated;
      } else {
        const [existing] = await tx.select().from(universities).where(eq(universities.id, id)).limit(1);
        updatedUni = existing;
      }

      if (!updatedUni) return null;

      // 2. Update programs (For simplicity, we delete all existing and re-insert if programs array is provided)
      let currentPrograms: typeof universityPrograms.$inferSelect[] = [];
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
          currentPrograms = await tx.insert(universityPrograms).values(programsToInsert).returning();
        }
      } else {
        currentPrograms = await tx.select().from(universityPrograms).where(eq(universityPrograms.universityId, id));
      }

      return { ...updatedUni, programs: currentPrograms } as University;
    });
  }

  async delete(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(universities)
      .where(eq(universities.id, id))
      .returning({ id: universities.id });
    
    return !!deleted;
  }
}

