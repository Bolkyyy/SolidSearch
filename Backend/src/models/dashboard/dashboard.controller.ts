import { Controller, Get } from '@nestjs/common';
import { DashboardService, DashboardData } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(): Promise<DashboardData> {
    return this.dashboardService.getDashboardData();
  }
}