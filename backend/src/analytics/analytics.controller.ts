import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@ApiTags('Аналитика')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('store/:storeId')
  @ApiOperation({
    summary: 'Получить аналитику магазина',
    description:
      'Возвращает сводные данные: выручку, средний чек, количество заказов по статусам и топ-5 товаров.',
  })
  @ApiParam({ name: 'storeId', description: 'UUID магазина' })
  @ApiResponse({
    status: 200,
    description: 'Данные аналитики успешно получены',
  })
  @ApiResponse({ status: 403, description: 'Нет доступа к магазину' })
  getStoreAnalytics(
    @CurrentUser('id') userId: string,
    @Param('storeId') storeId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getStoreAnalytics(userId, storeId, query);
  }
}
