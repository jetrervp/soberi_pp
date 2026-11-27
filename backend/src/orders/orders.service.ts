import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getStoreOrders(userId: string, storeId: string) {
    const member = await this.prisma.storeMember.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });

    if (!member) {
      throw new ForbiddenException(
        'У вас нет доступа к заказам этого магазина',
      );
    }

    return this.prisma.order.findMany({
      where: { storeId },
      include: {
        items: {
          include: {
            good: { select: { name: true, price: true } },
            size: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(
    userId: string,
    orderId: string,
    dto: UpdateOrderStatusDto,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Заказ не найден');
    }

    const member = await this.prisma.storeMember.findUnique({
      where: { userId_storeId: { userId, storeId: order.storeId } },
    });

    if (!member) {
      throw new ForbiddenException('У вас нет прав на изменение этого заказа');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
    });
  }
}
