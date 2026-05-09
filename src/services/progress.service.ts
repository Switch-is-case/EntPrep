import { UserProgressDTO } from "@/domain/analytics/types";
import { ProgressRepository } from "@/repositories/progress.repository";

export class ProgressService {
  constructor(private readonly progressRepository: ProgressRepository) {}
  async getUserProgress(userId: string): Promise<UserProgressDTO> {
    const [subjectProgress, recentSessions] = await Promise.all([
      this.progressRepository.findByUserId(userId),
      this.progressRepository.findRecentSessionsByUserId(userId, 10),
    ]);

    return { subjectProgress, recentSessions };
  }
}

