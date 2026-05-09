import { hashPassword, verifyPassword, createToken } from "@/lib/auth";
import { AuthResponseDTO, LoginDTO, RegisterDTO } from "@/domain/users/types";
import { loginSchema, registerSchema } from "@/domain/validation";
import { ValidationError, UnauthorizedError, ConflictError } from "@/lib/errors";
import { UsersRepository } from "@/repositories/users.repository";

export class AuthService {
  constructor(private readonly usersRepository: UsersRepository) {}
  async login(data: LoginDTO): Promise<AuthResponseDTO> {
    const validatedData = loginSchema.parse(data);

    const user = await this.usersRepository.findByEmail(validatedData.email);

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isPasswordValid = await verifyPassword(data.passwordRaw, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
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
    const validatedData = registerSchema.parse(data);

    const existingUser = await this.usersRepository.findByEmail(validatedData.email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await hashPassword(data.passwordRaw);

    const user = await this.usersRepository.create({
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

