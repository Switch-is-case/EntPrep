export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  language: string;
  profileSubject1: string | null;
  profileSubject2: string | null;
  
  targetCombinationId: number | null;
  targetSpecialtyId: number | null;
  targetUniversityId: number | null;
  targetScore: number | null;
  needsReonboarding: boolean;

  isAdmin: boolean;
  createdAt: Date;
}

export interface UserProfileDTO {
  id: string;
  email: string;
  name: string;
  language: string;
  profileSubject1: string | null;
  profileSubject2: string | null;
  
  targetCombinationId?: number | null;
  targetSpecialtyId?: number | null;
  targetUniversityId?: number | null;
  targetScore?: number | null;
  needsReonboarding?: boolean;
  isAdmin?: boolean;
}

export interface AuthResponseDTO {
  token: string;
  user: UserProfileDTO;
}

export interface CreateUserDTO {
  email: string;
  passwordHash: string;
  name: string;
  language?: string;
  needsReonboarding?: boolean;
}

export interface UpdateUserDTO {
  name?: string;
  language?: string;
  profileSubject1?: string | null;
  profileSubject2?: string | null;
  
  targetCombinationId?: number | null;
  targetSpecialtyId?: number | null;
  targetUniversityId?: number | null;
  targetScore?: number | null;
  needsReonboarding?: boolean;
  isAdmin?: boolean;
}

export interface LoginDTO {
  email: string;
  passwordRaw: string;
}

export interface RegisterDTO {
  email: string;
  passwordRaw: string;
  name: string;
  language?: string;
}
