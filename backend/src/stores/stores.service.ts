import {
  BadRequestException,
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

  async addManager(ownerId: string, storeId: string, managerEmail: string) {
    const owner = await this.prisma.storeMember.findUnique({
      where: { userId_storeId: { userId: ownerId, storeId } },
    });

    if (!owner || owner.role !== 'OWNER') {
      throw new ForbiddenException(
        'Только владелец магазина может назначать менеджеров',
      );
    }

    const userToAdd = await this.prisma.user.findUnique({
      where: { email: managerEmail },
    });

    if (!userToAdd) {
      throw new NotFoundException('Пользователь с таким email не найден');
    }

    const existingMember = await this.prisma.storeMember.findUnique({
      where: { userId_storeId: { userId: userToAdd.id, storeId } },
    });

    if (existingMember) {
      throw new BadRequestException(
        'Этот пользователь уже является участником магазина',
      );
    }

    return this.prisma.storeMember.create({
      data: {
        userId: userToAdd.id,
        storeId,
        role: 'MANAGER',
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async getStoreMembers(userId: string, storeId: string) {
    const member = await this.prisma.storeMember.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });

    if (!member) {
      throw new ForbiddenException('У вас нет доступа к этому магазину');
    }

    return this.prisma.storeMember.findMany({
      where: { storeId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async removeManager(ownerId: string, storeId: string, managerUserId: string) {
    const owner = await this.prisma.storeMember.findUnique({
      where: { userId_storeId: { userId: ownerId, storeId } },
    });

    if (!owner || owner.role !== 'OWNER') {
      throw new ForbiddenException(
        'Только владелец магазина может удалять менеджеров',
      );
    }

    const manager = await this.prisma.storeMember.findUnique({
      where: { userId_storeId: { userId: managerUserId, storeId } },
    });

    if (!manager) {
      throw new NotFoundException(
        'Пользователь не является участником этого магазина',
      );
    }

    if (manager.role === 'OWNER') {
      throw new BadRequestException('Нельзя удалить владельца магазина');
    }

    await this.prisma.storeMember.delete({
      where: { userId_storeId: { userId: managerUserId, storeId } },
    });

    return { message: 'Менеджер успешно удален' };
  }
}
