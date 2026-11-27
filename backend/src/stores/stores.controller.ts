import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoresService } from './stores.service';
import { JwtGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AddManagerDto } from './dto/add-manager.dto';

@ApiTags('Магазины')
@ApiBearerAuth()
@Controller('stores')
@UseGuards(JwtGuard)
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Создать новый магазин',
    description:
      'Создает магазин, назначает текущего пользователя владельцем (OWNER). Поддерживает загрузку логотипа и баннера (multipart/form-data).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Мой первый магазин' },
        description: { type: 'string', example: 'Лучший магазин одежды' },
        phone: { type: 'string', example: '+79991234567' },
        address: { type: 'string', example: 'г. Москва, ул. Ленина, д. 1' },
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Файл логотипа',
        },
        banner: {
          type: 'string',
          format: 'binary',
          description: 'Файл баннера',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Магазин успешно создан' })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные или ошибка загрузки файла',
  })
  @ApiResponse({
    status: 401,
    description: 'Не авторизован (отсутствует или неверный JWT)',
  })
  @ApiResponse({
    status: 409,
    description: 'Магазин с таким slug (URL) уже существует',
  })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStoreDto,
    @UploadedFiles()
    files: { logo?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    return this.storesService.createStore(userId, dto, files);
  }

  @Get('my')
  @ApiOperation({
    summary: 'Получить свои магазины',
    description:
      'Возвращает список всех магазинов, где текущий пользователь является участником (владельцем или менеджером).',
  })
  @ApiResponse({ status: 200, description: 'Список магазинов успешно получен' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  getMyStores(@CurrentUser('id') userId: string) {
    return this.storesService.getMyStores(userId);
  }

  @Post(':id/managers')
  @ApiOperation({
    summary: 'Назначить менеджера',
    description:
      'Добавляет пользователя в магазин с ролью MANAGER по его email. Доступно только владельцу (OWNER).',
  })
  @ApiParam({ name: 'id', description: 'UUID магазина' })
  @ApiBody({ type: AddManagerDto }) // Добавь в импорты: import { AddManagerDto } from './dto/add-manager.dto';
  @ApiResponse({ status: 201, description: 'Менеджер успешно назначен' })
  @ApiResponse({
    status: 400,
    description: 'Пользователь уже является участником',
  })
  @ApiResponse({ status: 403, description: 'Нет прав (вы не владелец)' })
  @ApiResponse({
    status: 404,
    description: 'Пользователь с таким email не найден',
  })
  addManager(
    @CurrentUser('id') userId: string,
    @Param('id') storeId: string,
    @Body() dto: AddManagerDto,
  ) {
    return this.storesService.addManager(userId, storeId, dto.email);
  }

  @Get(':id/members')
  @ApiOperation({
    summary: 'Получить список участников магазина',
    description:
      'Возвращает владельца и всех назначенных менеджеров с их email и именами.',
  })
  @ApiParam({ name: 'id', description: 'UUID магазина' })
  @ApiResponse({ status: 200, description: 'Список участников получен' })
  @ApiResponse({ status: 403, description: 'Нет доступа' })
  getStoreMembers(
    @CurrentUser('id') userId: string,
    @Param('id') storeId: string,
  ) {
    return this.storesService.getStoreMembers(userId, storeId);
  }

  @Delete(':id/managers/:managerUserId')
  @ApiOperation({
    summary: 'Удалить менеджера',
    description:
      'Снимает права менеджера с пользователя. Доступно только владельцу (OWNER).',
  })
  @ApiParam({ name: 'id', description: 'UUID магазина' })
  @ApiParam({
    name: 'managerUserId',
    description: 'UUID пользователя-менеджера',
  })
  @ApiResponse({ status: 200, description: 'Менеджер удален' })
  @ApiResponse({ status: 400, description: 'Нельзя удалить владельца' })
  @ApiResponse({ status: 403, description: 'Нет прав' })
  removeManager(
    @CurrentUser('id') userId: string,
    @Param('id') storeId: string,
    @Param('managerUserId') managerUserId: string,
  ) {
    return this.storesService.removeManager(userId, storeId, managerUserId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить магазин по ID',
    description:
      'Возвращает подробную информацию о конкретном магазине, если у пользователя есть к нему доступ.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID магазина',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Информация о магазине' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 404,
    description: 'Магазин не найден или нет доступа',
  })
  getStoreById(
    @CurrentUser('id') userId: string,
    @Param('id') storeId: string,
  ) {
    return this.storesService.getStoreById(userId, storeId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Обновить магазин',
    description:
      'Обновляет данные магазина. Доступно только владельцу (OWNER). Можно передавать только те поля, которые нужно изменить.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID магазина',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Магазин успешно обновлен' })
  @ApiResponse({ status: 400, description: 'Некорректные данные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Нет прав (пользователь не является владельцем)',
  })
  @ApiResponse({ status: 404, description: 'Магазин не найден' })
  @ApiResponse({ status: 409, description: 'Новый slug уже занят' })
  updateStore(
    @CurrentUser('id') userId: string,
    @Param('id') storeId: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.updateStore(userId, storeId, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить магазин',
    description:
      'Удаляет магазин и все связанные с ним данные (участники, товары). Доступно только владельцу (OWNER).',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID магазина',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({ status: 200, description: 'Магазин успешно удален' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({
    status: 403,
    description: 'Нет прав (пользователь не является владельцем)',
  })
  @ApiResponse({ status: 404, description: 'Магазин не найден' })
  deleteStore(@CurrentUser('id') userId: string, @Param('id') storeId: string) {
    return this.storesService.deleteStore(userId, storeId);
  }
}
