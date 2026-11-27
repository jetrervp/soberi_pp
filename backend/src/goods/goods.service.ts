import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoodDto } from './dto/create-good.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSizeDto } from './dto/create-size.dto';
import { GetGoodsQueryDto } from './dto/get-goods-query.dto';

@Injectable()
export class GoodsService {
  constructor(private readonly prisma: PrismaService) {}

  async createGood(userId: string, dto: CreateGoodDto) {
    const member = await this.prisma.storeMember.findUnique({
      where: {
        userId_storeId: { userId, storeId: dto.storeId },
      },
    });

    if (!member) {
      throw new ForbiddenException(
        'У вас нет прав на добавление товаров в этот магазин',
      );
    }

    const category = await this.prisma.goodCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) throw new NotFoundException('Категория не найдена');

    const sizesData =
      dto.sizes?.map((size) => ({
        sizeId: size.sizeId,
        stock: size.stock,
      })) || [];

    return this.prisma.good.create({
      data: {
        storeId: dto.storeId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        isActive: dto.isActive ?? true,
        sizes: {
          create: sizesData,
        },
      },
      include: {
        sizes: true,
      },
    });
  }

  async createCategory(dto: CreateCategoryDto) {
    if (dto.parentId) {
      const parent = await this.prisma.goodCategory.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent)
        throw new NotFoundException('Родительская категория не найдена');
    }
    return this.prisma.goodCategory.create({ data: dto });
  }

  async getCategories() {
    return this.prisma.goodCategory.findMany({ orderBy: { name: 'asc' } });
  }

  async createSize(dto: CreateSizeDto) {
    const existing = await this.prisma.size.findUnique({
      where: { name: dto.name },
    });
    if (existing) return existing;
    return this.prisma.size.create({ data: dto });
  }

  async getSizes() {
    return this.prisma.size.findMany({ orderBy: { name: 'asc' } });
  }

  async getAllGoods(query: GetGoodsQueryDto) {
    const { storeId, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Формируем условия поиска
    const where: any = {};
    if (storeId) where.storeId = storeId;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }; // Поиск без учета регистра
    }

    // Получаем товары и общее количество для пагинации
    const [items, total] = await Promise.all([
      this.prisma.good.findMany({
        where,
        skip,
        take: limit,
        include: {
          sizes: { include: { size: true } }, // Подтягиваем названия размеров
          category: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.good.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGoodById(id: string) {
    const good = await this.prisma.good.findUnique({
      where: { id },
      include: {
        sizes: { include: { size: true } },
        category: true,
        store: { select: { name: true, slug: true } },
      },
    });

    if (!good) {
      throw new NotFoundException('Товар не найден');
    }

    return good;
  }
}
