import { University, CreateUniversityDTO, UpdateUniversityDTO } from "@/domain/universities/types";
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
    this.validateUniversityData(data);
    return this.universitiesRepository.create(data);
  }

  async updateUniversity(id: number, data: UpdateUniversityDTO): Promise<University | null> {
    if (data.nameRu === "" || data.cityRu === "") {
      throw new ValidationError("Names and cities cannot be empty strings");
    }
    return this.universitiesRepository.update(id, data);
  }

  async deleteUniversity(id: number): Promise<boolean> {
    return this.universitiesRepository.delete(id);
  }

  private validateUniversityData(data: CreateUniversityDTO) {
    if (!data.nameRu || !data.nameKz || !data.nameEn || !data.cityRu || !data.cityKz || !data.cityEn) {
      throw new ValidationError("Names and cities in all languages are required");
    }
  }
}

