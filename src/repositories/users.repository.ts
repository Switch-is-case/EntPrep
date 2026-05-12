import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc, ilike, sql, and, isNull, isNotNull } from "drizzle-orm";
import { User, CreateUserDTO, UpdateUserDTO } from "@/domain/users/types";

export class UsersRepository {
  async findAll(page: number = 1, limit: number = 20, search?: string): Promise<{ users: User[]; total: number }> {
    const conditions = [isNull(users.deletedAt)]; // By default, don't show deleted users in the main list

    if (search) {
      conditions.push(sql`(${users.name} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`})`);
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const allUsers = await db
      .select()
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(where);

    return {
      users: allUsers as User[],
      total: Number(totalCount.count)
    };
  }

  async findAllWithFilters(filters: {
    search?: string;
    isAdmin?: boolean;
    isBanned?: boolean;
    isDeleted?: boolean;
    emailVerified?: boolean;
    page: number;
    pageSize: number;
  }): Promise<{ users: User[]; total: number }> {
    const { page, pageSize, search, isAdmin, isBanned, isDeleted, emailVerified } = filters;
    const offset = (page - 1) * pageSize;

    const conditions = [];

    if (search) {
      conditions.push(sql`(${users.name} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`})`);
    }

    if (isAdmin !== undefined) {
      conditions.push(eq(users.isAdmin, isAdmin));
    }

    if (isBanned !== undefined) {
      if (isBanned) {
        conditions.push(isNotNull(users.bannedAt));
      } else {
        conditions.push(isNull(users.bannedAt));
      }
    }

    if (isDeleted !== undefined) {
      if (isDeleted) {
        conditions.push(isNotNull(users.deletedAt));
      } else {
        conditions.push(isNull(users.deletedAt));
      }
    }

    if (emailVerified !== undefined) {
      conditions.push(eq(users.emailVerified, emailVerified));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const allUsers = await db
      .select()
      .from(users)
      .where(where)
      .orderBy(desc(users.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(where);

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

  async setAdminStatus(id: string, isAdmin: boolean): Promise<User | null> {
    const [updated] = await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, id))
      .returning();

    return (updated as User) || null;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });

    return result.length > 0;
  }

  async countAdmins(): Promise<number> {
    const [adminCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isAdmin, true));

    return Number(adminCount.count);
  }

  async banUser(userId: string, reason: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        bannedAt: new Date(), 
        banReason: reason,
        sessionVersion: sql`${users.sessionVersion} + 1`
      })
      .where(eq(users.id, userId));
  }

  async unbanUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        bannedAt: null, 
        banReason: null,
        sessionVersion: sql`${users.sessionVersion} + 1`
      })
      .where(eq(users.id, userId));
  }

  async softDeleteUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        deletedAt: new Date(),
        sessionVersion: sql`${users.sessionVersion} + 1`
      })
      .where(eq(users.id, userId));
  }

  async restoreUser(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        deletedAt: null,
        sessionVersion: sql`${users.sessionVersion} + 1`
      })
      .where(eq(users.id, userId));
  }

  async incrementSessionVersion(userId: string): Promise<void> {
    await db
      .update(users)
      .set({ sessionVersion: sql`${users.sessionVersion} + 1` })
      .where(eq(users.id, userId));
  }
}

