import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../common/minio/minio.service';
import slugify from 'slugify';

@Injectable()
export class StoresService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  async createStore(
    userId: string,
    dto: CreateStoreDto,
    files?: { logo?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    const slug = dto.slug || slugify(dto.name, { lower: true });

    const existing = await this.prisma.store.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException('Магазин с таким URL уже существует');
    }

    let logoUrl: string | null = null;
    if (files?.logo && files.logo.length > 0) {
      logoUrl = await this.minioService.uploadFile(files.logo[0], 'logos');
    }

    let bannerUrl: string | null = null;
    if (files?.banner && files.banner.length > 0) {
      bannerUrl = await this.minioService.uploadFile(
        files.banner[0],
        'banners',
      );
    }

    return this.prisma.store.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        phone: dto.phone,
        address: dto.address,
        logoUrl,
        bannerUrl,
        members: {
          create: {
            userId: userId,
            role: 'OWNER',
          },
        },
      },
    });
  }

  async deleteStore(userId: string, storeId: string) {
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
      include: { members: true },
    });

    if (!store) {
      throw new NotFoundException('Магазин не найден');
    }

    const member = store.members.find((m) => m.userId === userId);
    if (!member || member.role !== 'OWNER') {
      throw new ForbiddenException('У вас нет прав на удаление этого магазина');
    }

    return this.prisma.$transaction(async (prisma) => {
      await prisma.storeMember.deleteMany({
        where: { storeId: storeId },
      });

      await prisma.good.deleteMany({
        where: { storeId: storeId },
      });

      return prisma.store.delete({
        where: { id: storeId },
      });
    });
  }

  async updateStore(userId: string, storeId: string, dto: UpdateStoreDto) {
    const member = await this.prisma.storeMember.findUnique({
      where: {
        userId_storeId: { userId, storeId },
      },
    });

    if (!member) {
      throw new NotFoundException(
        'Магазин не найден или у вас нет к нему доступа',
      );
    }

    if (member.role !== 'OWNER') {
      throw new ForbiddenException(
        'Только владелец может редактировать магазин',
      );
    }

    if (dto.slug) {
      const existingSlug = await this.prisma.store.findUnique({
        where: { slug: dto.slug },
      });
      if (existingSlug && existingSlug.id !== storeId) {
        throw new ConflictException('Магазин с таким URL уже существует');
      }
    }

    return this.prisma.store.update({
      where: { id: storeId },
      data: {
        ...dto,
      },
    });
  }

  async getMyStores(userId: string) {
    return this.prisma.store.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        logoUrl: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getStoreById(userId: string, storeId: string) {
    const store = await this.prisma.store.findFirst({
      where: {
        id: storeId,
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
    });

    if (!store) {
      throw new NotFoundException('Магазин не найден');
    }

    return store;
  }
}
