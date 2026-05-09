import { AdminDashboardDTO } from "@/domain/analytics/types";
import { AnalyticsRepository } from "@/repositories/analytics.repository";

export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}
  async getAdminDashboard(): Promise<AdminDashboardDTO> {
    return this.analyticsRepository.getAdminDashboard();
  }
}

