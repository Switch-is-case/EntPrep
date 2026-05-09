import { University, CreateUniversityDTO, UpdateUniversityDTO } from "@/domain/universities/types";
import { universitiesRepository } from "@/repositories/universities.repository";

export class UniversitiesService {
  async getAllUniversities(search?: string): Promise<University[]> {
    return universitiesRepository.findAll(search);
  }

  async getUniversityById(id: number): Promise<University | null> {
    return universitiesRepository.findById(id);
  }

  async createUniversity(data: CreateUniversityDTO): Promise<University> {
    this.validateUniversityData(data);
    return universitiesRepository.create(data);
  }

  async updateUniversity(id: number, data: UpdateUniversityDTO): Promise<University | null> {
    if (data.nameRu === "" || data.cityRu === "") {
      throw new Error("Names and cities cannot be empty strings");
    }
    return universitiesRepository.update(id, data);
  }

  async deleteUniversity(id: number): Promise<boolean> {
    return universitiesRepository.delete(id);
  }

  private validateUniversityData(data: CreateUniversityDTO) {
    if (!data.nameRu || !data.nameKz || !data.nameEn || !data.cityRu || !data.cityKz || !data.cityEn) {
      throw new Error("Names and cities in all languages are required");
    }
  }
}

export const universitiesService = new UniversitiesService();
