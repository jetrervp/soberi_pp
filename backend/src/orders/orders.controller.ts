import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Заказы')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('store/:storeId')
  @ApiOperation({
    summary: 'Получить заказы магазина',
    description:
      'Возвращает список заказов для указанного магазина. Доступно только участникам магазина.',
  })
  @ApiParam({ name: 'storeId', description: 'UUID магазина' })
  @ApiResponse({ status: 200, description: 'Список заказов' })
  @ApiResponse({ status: 403, description: 'Нет доступа к магазину' })
  getStoreOrders(
    @CurrentUser('id') userId: string,
    @Param('storeId') storeId: string,
  ) {
    return this.ordersService.getStoreOrders(userId, storeId);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Изменить статус заказа',
    description: 'Меняет статус заказа (например, на PROCESSING или SHIPPED).',
  })
  @ApiParam({ name: 'id', description: 'UUID заказа' })
  @ApiResponse({ status: 200, description: 'Статус обновлен' })
  @ApiResponse({ status: 403, description: 'Нет прав на изменение' })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') orderId: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(userId, orderId, dto);
  }
}
