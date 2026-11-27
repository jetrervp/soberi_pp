import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStoreAnalytics(
    userId: string,
    storeId: string,
    query: AnalyticsQueryDto,
  ) {
    const member = await this.prisma.storeMember.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });

    if (!member) {
      throw new ForbiddenException(
        'У вас нет доступа к аналитике этого магазина',
      );
    }

    const dateFilter: any = {};
    if (query.startDate || query.endDate) {
      dateFilter.createdAt = {};
      if (query.startDate) dateFilter.createdAt.gte = new Date(query.startDate);
      if (query.endDate) dateFilter.createdAt.lte = new Date(query.endDate);
    }

    const whereClause = { storeId, ...dateFilter };

    const revenueData = await this.prisma.order.aggregate({
      where: {
        ...whereClause,
        status: {
          in: [
            OrderStatus.PENDING,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ],
        },
      },
      _sum: { totalPrice: true },
      _avg: { totalPrice: true },
    });

    const ordersCount = await this.prisma.order.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { id: true },
    });

    const totalOrders = ordersCount.reduce(
      (acc, curr) => acc + curr._count.id,
      0,
    );

    const topGoods = await this.prisma.orderItem.groupBy({
      by: ['goodId'],
      where: {
        order: whereClause,
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const goodIds = topGoods.map((item) => item.goodId);
    const goodsInfo = await this.prisma.good.findMany({
      where: { id: { in: goodIds } },
      select: { id: true, name: true },
    });

    const topGoodsWithNames = topGoods.map((item) => ({
      goodId: item.goodId,
      name:
        goodsInfo.find((g) => g.id === item.goodId)?.name || 'Удаленный товар',
      totalSold: item._sum.quantity,
    }));

    return {
      summary: {
        totalRevenue: revenueData._sum.totalPrice || 0,
        averageCheck: Math.round(revenueData._avg.totalPrice || 0),
        totalOrders,
      },
      ordersByStatus: ordersCount.reduce(
        (acc, curr) => {
          acc[curr.status] = curr._count.id;
          return acc;
        },
        {} as Record<string, number>,
      ),
      topGoods: topGoodsWithNames,
    };
  }
}
