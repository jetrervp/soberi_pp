import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCoupon(userId: string, storeId: string, dto: CreateCouponDto) {
    const member = await this.prisma.storeMember.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });
    if (!member) throw new ForbiddenException('Нет доступа к магазину');

    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code },
    });
    if (existing) throw new ConflictException('Такой промокод уже существует');

    return this.prisma.coupon.create({
      data: {
        storeId,
        code: dto.code.toUpperCase(),
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderAmount: dto.minOrderAmount,
        maxUses: dto.maxUses,
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
      },
    });
  }

  async getStoreCoupons(userId: string, storeId: string) {
    const member = await this.prisma.storeMember.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });
    if (!member) throw new ForbiddenException('Нет доступа');

    return this.prisma.coupon.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
