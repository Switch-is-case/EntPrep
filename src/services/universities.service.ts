import { University, CreateUniversityDTO, UpdateUniversityDTO } from "@/domain/universities/types";
import { createUniversitySchema } from "@/domain/validation";
import { UniversitiesRepository } from "@/repositories/universities.repository";
import { ValidationError } from "@/lib/errors";
import { unstable_cache, revalidateTag } from "next/cache";

export class UniversitiesService {
  constructor(private readonly universitiesRepository: UniversitiesRepository) {}

  /**
   * Возвращает все университеты с кэшированием на 1 час (3600 сек).
   * Кэш инвалидируется тегом 'universities' при создании/обновлении/удалении.
   */
  async getAllUniversities(search?: string): Promise<University[]> {
    const cachedFetch = unstable_cache(
      () => this.universitiesRepository.findAll(search),
      ["universities", search ?? "all"],
      { revalidate: 3600, tags: ["universities"] }
    );
    return cachedFetch();
  }

  async getUniversityById(id: number): Promise<University | null> {
    return this.universitiesRepository.findById(id);
  }

  async createUniversity(data: CreateUniversityDTO): Promise<University> {
    const validatedData = createUniversitySchema.parse(data);
    const result = await this.universitiesRepository.create(validatedData as CreateUniversityDTO);
    revalidateTag("universities");
    return result;
  }

  async updateUniversity(id: number, data: UpdateUniversityDTO): Promise<University | null> {
    const validatedData = createUniversitySchema.partial().parse(data);
    const result = await this.universitiesRepository.update(id, validatedData as UpdateUniversityDTO);
    revalidateTag("universities");
    return result;
  }

  async deleteUniversity(id: number): Promise<boolean> {
    const result = await this.universitiesRepository.delete(id);
    revalidateTag("universities");
    return result;
  }
}

