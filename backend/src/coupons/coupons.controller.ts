import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { JwtGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Купоны')
@ApiBearerAuth()
@Controller('coupons')
@UseGuards(JwtGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('store/:storeId')
  @ApiOperation({ summary: 'Создать купон для магазина' })
  @ApiParam({ name: 'storeId', description: 'UUID магазина' })
  create(
    @CurrentUser('id') userId: string,
    @Param('storeId') storeId: string,
    @Body() dto: CreateCouponDto,
  ) {
    return this.couponsService.createCoupon(userId, storeId, dto);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Получить все купоны магазина' })
  @ApiParam({ name: 'storeId', description: 'UUID магазина' })
  getStoreCoupons(
    @CurrentUser('id') userId: string,
    @Param('storeId') storeId: string,
  ) {
    return this.couponsService.getStoreCoupons(userId, storeId);
  }
}
