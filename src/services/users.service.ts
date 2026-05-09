import { User, UpdateUserDTO, UserProfileDTO } from "@/domain/users/types";
import { UsersRepository } from "@/repositories/users.repository";
import { NotFoundError, ForbiddenError } from "@/lib/errors";

export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getAllUsers(page: number = 1, limit: number = 20, search?: string) {
    const { users, total } = await this.usersRepository.findAll(page, limit, search);
    return {
      users: users.map(u => this.mapToProfileDTO(u)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserProfile(id: string): Promise<UserProfileDTO | null> {
    const user = await this.usersRepository.findById(id);
    if (!user) return null;

    return this.mapToProfileDTO(user);
  }

  async updateProfile(id: string, data: UpdateUserDTO): Promise<UserProfileDTO> {
    const updatedUser = await this.usersRepository.update(id, data);
    if (!updatedUser) {
      throw new NotFoundError("User not found");
    }
    return this.mapToProfileDTO(updatedUser);
  }

  async makeAdmin(id: string, adminSecret?: string): Promise<UserProfileDTO> {
    const adminCount = await this.usersRepository.countAdmins();
    const hasAdmins = adminCount > 0;
    const secretValid = adminSecret === (process.env.ADMIN_SECRET || "entadmin2024");

    if (!hasAdmins || secretValid) {
      const updated = await this.usersRepository.makeAdmin(id);
      if (!updated) throw new NotFoundError("User not found");
      return this.mapToProfileDTO(updated);
    }

    throw new ForbiddenError("Admin already exists. Use admin secret to become admin.");
  }

  private mapToProfileDTO(user: User): UserProfileDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      language: user.language,
      profileSubject1: user.profileSubject1,
      profileSubject2: user.profileSubject2,
    };
  }
}

