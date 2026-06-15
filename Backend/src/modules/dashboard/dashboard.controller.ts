import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService, DashboardData } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get()
  async getDashboard(): Promise<DashboardData> {
    return this.dashboardService.getDashboardData();
  }

  @Get('search-analytics')
  async getSearchAnalytics(@Query('countDays') countDays: string): Promise<DashboardData> {
    return this.dashboardService.getSearchData(parseInt(countDays));
  }

  @Get('response-time-analytics')
  async getResponseTimeAnalytics(@Query('countDays') countDays: string): Promise<any> {
    return this.dashboardService.getResponseTimeData(parseInt(countDays) || 30);
  }

  @Get('top-queries')
  async getTopQueries(@Query('countDays') countDays: string, @Query('limit') limit: string): Promise<any> {
    return this.dashboardService.getTopQueries(parseInt(countDays) || 30, parseInt(limit) || 8);
  }

  @Get('document-indexing-analytics')
  async getDocumentIndexingAnalytics(@Query('countDays') countDays: string): Promise<any> {
    return this.dashboardService.getDocumentIndexingData(parseInt(countDays) || 30);
  }

  @Get('searches-by-hour')
  async getSearchesByHour(@Query('countDays') countDays: string): Promise<any> {
    return this.dashboardService.getSearchesByHour(parseInt(countDays) || 30);
  }

  @Get('searches-by-weekday')
  async getSearchesByWeekday(@Query('countDays') countDays: string): Promise<any> {
    return this.dashboardService.getSearchesByWeekday(parseInt(countDays) || 30);
  }

  @Get('indexing-by-weekday')
  async getIndexingByWeekday(@Query('countDays') countDays: string): Promise<any> {
    return this.dashboardService.getDocumentIndexingByWeekday(parseInt(countDays) || 30);
  }

  @Get('avg-result-count')
  async getAvgResultCount(@Query('countDays') countDays: string): Promise<any> {
    return this.dashboardService.getAvgResultCount(parseInt(countDays) || 30);
  }

  @Get('query-types')
  async getQueryTypes(@Query('countDays') countDays: string): Promise<any> {
    return this.dashboardService.getQueryTypes(parseInt(countDays) || 30);
  }

  @Get('search-success-rate')
  async getSearchSuccessRate(@Query('countDays') countDays: string): Promise<any> {
    return this.dashboardService.getSearchSuccessRate(parseInt(countDays) || 30);
  }

  @Get('avg-success-rate')
  async getAvgSuccessRate(@Query('countDays') countDays: string): Promise<any> {
    return this.dashboardService.getAvgSuccessRate(parseInt(countDays) || 30);
  }

  @Get('top-users')
  async getTopUsers(@Query('countDays') countDays: string): Promise<any> {
    return this.dashboardService.getTopUsers(parseInt(countDays) || 30, 8);
  }
}