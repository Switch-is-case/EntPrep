import { AdminDashboardDTO } from "@/domain/analytics/types";
import { analyticsRepository } from "@/repositories/analytics.repository";

export class AnalyticsService {
  async getAdminDashboard(): Promise<AdminDashboardDTO> {
    return analyticsRepository.getAdminDashboard();
  }
}

export const analyticsService = new AnalyticsService();
