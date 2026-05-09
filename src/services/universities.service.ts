import { University, CreateUniversityDTO, UpdateUniversityDTO } from "@/domain/universities/types";
import { createUniversitySchema } from "@/domain/validation";
import { UniversitiesRepository } from "@/repositories/universities.repository";
import { ValidationError } from "@/lib/errors";

export class UniversitiesService {
  constructor(private readonly universitiesRepository: UniversitiesRepository) {}

  async getAllUniversities(search?: string): Promise<University[]> {
    return this.universitiesRepository.findAll(search);
  }

  async getUniversityById(id: number): Promise<University | null> {
    return this.universitiesRepository.findById(id);
  }

  async createUniversity(data: CreateUniversityDTO): Promise<University> {
    const validatedData = createUniversitySchema.parse(data);
    return this.universitiesRepository.create(validatedData as CreateUniversityDTO);
  }

  async updateUniversity(id: number, data: UpdateUniversityDTO): Promise<University | null> {
    const validatedData = createUniversitySchema.partial().parse(data);
    return this.universitiesRepository.update(id, validatedData as UpdateUniversityDTO);
  }

  async deleteUniversity(id: number): Promise<boolean> {
    return this.universitiesRepository.delete(id);
  }
}

