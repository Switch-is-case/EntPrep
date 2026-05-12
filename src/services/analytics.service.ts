import { AdminDashboardDTO } from "@/domain/analytics/types";
import { AnalyticsRepository } from "@/repositories/analytics.repository";

export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getAdminDashboard(): Promise<AdminDashboardDTO> {
    return this.analyticsRepository.getAdminDashboard();
  }

  async getDashboardOverview(period: "7d" | "30d" | "90d"): Promise<AdminDashboardDTO> {
    const daysMap = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
    };
    return this.analyticsRepository.getDashboardOverview(daysMap[period]);
  }
}
