import { UserProgressDTO } from "@/domain/analytics/types";
import { progressRepository } from "@/repositories/progress.repository";

export class ProgressService {
  async getUserProgress(userId: string): Promise<UserProgressDTO> {
    const [subjectProgress, recentSessions] = await Promise.all([
      progressRepository.findByUserId(userId),
      progressRepository.findRecentSessionsByUserId(userId, 10),
    ]);

    return { subjectProgress, recentSessions };
  }
}

export const progressService = new ProgressService();
