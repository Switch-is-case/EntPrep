import { User, UpdateUserDTO, UserProfileDTO } from "@/domain/users/types";
import { UsersRepository } from "@/repositories/users.repository";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { AuditService } from "@/services/audit.service";
import { AuditAction, AuditEntityType } from "@/types/audit";

export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AuditService
  ) {}



  async getAllUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    filters?: {
      isAdmin?: boolean;
      isBanned?: boolean;
      isDeleted?: boolean;
      emailVerified?: boolean;
    }
  ) {
    const result = filters 
      ? await this.usersRepository.findAllWithFilters({ ...filters, search, page, pageSize: limit })
      : await this.usersRepository.findAll(page, limit, search);

    return {
      users: result.users.map(u => this.mapToProfileDTO(u)),
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
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

  async setAdminStatus(
    requesterId: string,
    adminEmail: string,
    targetId: string,
    isAdmin: boolean,
    ip?: string
  ): Promise<UserProfileDTO> {
    if (requesterId === targetId && isAdmin === false) {
      throw new ForbiddenError("Cannot remove your own admin status");
    }
    
    const user = await this.usersRepository.findById(targetId);
    if (!user) throw new NotFoundError("User not found");

    const updated = await this.usersRepository.setAdminStatus(targetId, isAdmin);
    if (!updated) throw new NotFoundError("User not found");

    await this.auditService.createLog({
      actorId: requesterId,
      actorEmail: adminEmail,
      action: isAdmin ? AuditAction.USER_ADMIN_GRANTED : AuditAction.USER_ADMIN_REVOKED,
      entityType: AuditEntityType.USER,
      entityId: targetId,
      description: isAdmin ? "Admin status granted" : "Admin status revoked",
      oldValue: { isAdmin: user.isAdmin },
      newValue: { isAdmin },
      ip,
    });

    return this.mapToProfileDTO(updated);
  }

  async banUser(
    adminId: string,
    adminEmail: string,
    userId: string,
    reason: string,
    ip?: string
  ): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Idempotency: if already banned, do nothing
    if (user.bannedAt) return;

    await this.usersRepository.banUser(userId, reason);

    await this.auditService.createLog({
      actorId: adminId,
      actorEmail: adminEmail,
      action: AuditAction.USER_BANNED,
      entityType: AuditEntityType.USER,
      entityId: userId,
      description: `User banned. Reason: ${reason}`,
      oldValue: { bannedAt: user.bannedAt },
      newValue: { bannedAt: new Date(), banReason: reason },
      ip,
    });
  }

  async unbanUser(
    adminId: string,
    adminEmail: string,
    userId: string,
    ip?: string
  ): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Idempotency: if not banned, do nothing
    if (!user.bannedAt) return;

    await this.usersRepository.unbanUser(userId);

    await this.auditService.createLog({
      actorId: adminId,
      actorEmail: adminEmail,
      action: AuditAction.USER_UNBANNED,
      entityType: AuditEntityType.USER,
      entityId: userId,
      description: "User unbanned",
      oldValue: { bannedAt: user.bannedAt },
      newValue: { bannedAt: null },
      ip,
    });
  }

  async softDeleteUser(
    adminId: string,
    adminEmail: string,
    userId: string,
    ip?: string
  ): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Idempotency: if already deleted, do nothing
    if (user.deletedAt) return;

    if (user.isAdmin) {
      throw new ForbiddenError("Cannot delete admin users");
    }

    if (adminId === userId) {
      throw new ForbiddenError("Cannot delete yourself");
    }

    await this.usersRepository.softDeleteUser(userId);

    await this.auditService.createLog({
      actorId: adminId,
      actorEmail: adminEmail,
      action: AuditAction.USER_DELETED,
      entityType: AuditEntityType.USER,
      entityId: userId,
      description: "User soft deleted",
      oldValue: { deletedAt: user.deletedAt },
      newValue: { deletedAt: new Date() },
      ip,
    });
  }

  async restoreUser(
    adminId: string,
    adminEmail: string,
    userId: string,
    ip?: string
  ): Promise<void> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    // Idempotency: if not deleted, do nothing
    if (!user.deletedAt) return;

    await this.usersRepository.restoreUser(userId);

    await this.auditService.createLog({
      actorId: adminId,
      actorEmail: adminEmail,
      action: AuditAction.USER_RESTORED,
      entityType: AuditEntityType.USER,
      entityId: userId,
      description: "User restored",
      oldValue: { deletedAt: user.deletedAt },
      newValue: { deletedAt: null },
      ip,
    });
  }

  async deleteUser(requesterId: string, targetId: string): Promise<void> {
    // Note: Task asks for softDelete, but keeping this for hard delete if needed, 
    // or just call softDelete if we want to change behavior of existing DELETE route.
    return this.softDeleteUser(requesterId, "system@admin.com", targetId); 
  }

  async validateSession(userId: string, tokenVersion?: number): Promise<{
    valid: boolean;
    reason?: "banned" | "deleted" | "mismatch" | "not_found";
    banReason?: string | null;
  }> {
    const user = await this.usersRepository.findById(userId);
    if (!user) return { valid: false, reason: "not_found" };

    if (user.deletedAt) return { valid: false, reason: "deleted" };
    if (user.bannedAt) return { valid: false, reason: "banned", banReason: user.banReason };

    // Handle missing sessionVersion in old JWTs (treat as version 1)
    const currentTokenVersion = tokenVersion ?? 1;
    if (user.sessionVersion > currentTokenVersion) {
      return { valid: false, reason: "mismatch" };
    }

    return { valid: true };
  }

  private mapToProfileDTO(user: User): UserProfileDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      language: user.language,
      profileSubject1: user.profileSubject1,
      profileSubject2: user.profileSubject2,
      targetCombinationId: user.targetCombinationId,
      targetSpecialtyId: user.targetSpecialtyId,
      targetUniversityId: user.targetUniversityId,
      targetScore: user.targetScore,
      needsReonboarding: user.needsReonboarding,
      emailVerified: user.emailVerified,
      isAdmin: user.isAdmin ?? false,
      bannedAt: user.bannedAt,
      banReason: user.banReason,
      deletedAt: user.deletedAt,
    };
  }
}

