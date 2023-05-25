import { Body, Controller, Param, Post } from '@nestjs/common';
import { DashboardService } from '../service/dashboard.service';
import { DashBoardStatisticDTO } from '../dto/dashBoardStatistic.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Post('statistic/:tabId')
  async getstatisticForTab(
    @Param('tabId') tabId: string,
    @Body() data: DashBoardStatisticDTO,
  ) {
    const result = new ReturnResult<object>();
    try {
      const chartResult = await this.dashboardService.getLineChart(
        tabId,
        new Date(data.startDate),
        new Date(data.endDate),
      );
      result.result = chartResult;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
