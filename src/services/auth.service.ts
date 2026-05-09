import { hashPassword, verifyPassword, createToken } from "@/lib/auth";
import { AuthResponseDTO, LoginDTO, RegisterDTO } from "@/domain/users/types";
import { usersRepository } from "@/repositories/users.repository";

export class AuthService {
  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    if (!data.email || !data.passwordRaw) {
      throw new Error("Email and password are required");
    }

    const user = await usersRepository.findByEmail(data.email);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isPasswordValid = await verifyPassword(data.passwordRaw, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = createToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        language: user.language,
        profileSubject1: user.profileSubject1,
        profileSubject2: user.profileSubject2,
      },
    };
  }

  async register(data: RegisterDTO): Promise<AuthResponseDTO> {
    if (!data.email || !data.passwordRaw || !data.name) {
      throw new Error("Email, password, and name are required");
    }

    const existingUser = await usersRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const passwordHash = await hashPassword(data.passwordRaw);

    const user = await usersRepository.create({
      email: data.email,
      passwordHash,
      name: data.name,
      language: data.language || "ru",
    });

    const token = createToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        language: user.language,
        profileSubject1: user.profileSubject1,
        profileSubject2: user.profileSubject2,
      },
    };
  }
}

export const authService = new AuthService();
