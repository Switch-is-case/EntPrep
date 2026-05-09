export interface UniversityProgram {
  id: number;
  universityId: number;
  nameRu: string;
  nameKz: string;
  nameEn: string;
  passingScore: number;
  descriptionRu: string | null;
  descriptionKz: string | null;
  descriptionEn: string | null;
  createdAt: Date;
}

export interface University {
  id: number;
  nameRu: string;
  nameKz: string;
  nameEn: string;
  cityRu: string;
  cityKz: string;
  cityEn: string;
  descriptionRu: string | null;
  descriptionKz: string | null;
  descriptionEn: string | null;
  logoUrl: string | null;
  createdAt: Date;
  programs?: UniversityProgram[];
}

export interface CreateProgramDTO {
  nameRu: string;
  nameKz: string;
  nameEn: string;
  passingScore: number;
  descriptionRu?: string | null;
  descriptionKz?: string | null;
  descriptionEn?: string | null;
}

export interface CreateUniversityDTO {
  nameRu: string;
  nameKz: string;
  nameEn: string;
  cityRu: string;
  cityKz: string;
  cityEn: string;
  descriptionRu?: string | null;
  descriptionKz?: string | null;
  descriptionEn?: string | null;
  logoUrl?: string | null;
  programs?: CreateProgramDTO[];
}

export interface UpdateUniversityDTO extends Partial<CreateUniversityDTO> {}
