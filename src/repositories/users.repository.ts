import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc, ilike, sql } from "drizzle-orm";
import { User, CreateUserDTO, UpdateUserDTO } from "@/domain/users/types";

export class UsersRepository {
  async findAll(page: number = 1, limit: number = 20, search?: string): Promise<{ users: User[]; total: number }> {
    let query = db.select().from(users);

    if (search) {
      query = query.where(
        sql`${users.name} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`}`
      ) as typeof query;
    }

    const allUsers = await query
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);

    return {
      users: allUsers as User[],
      total: Number(totalCount.count)
    };
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    return (user as User) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    return (user as User) || null;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        language: data.language || "ru",
      })
      .returning();

    return user as User;
  }

  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    if (Object.keys(data).length === 0) return this.findById(id);

    const [updated] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();

    return (updated as User) || null;
  }

  async makeAdmin(id: string): Promise<User | null> {
    const [updated] = await db
      .update(users)
      .set({ isAdmin: true })
      .where(eq(users.id, id))
      .returning();

    return (updated as User) || null;
  }

  async countAdmins(): Promise<number> {
    const [adminCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isAdmin, true));

    return Number(adminCount.count);
  }
}

