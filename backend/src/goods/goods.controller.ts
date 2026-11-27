import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { GoodsService } from './goods.service';
import { CreateGoodDto } from './dto/create-good.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSizeDto } from './dto/create-size.dto';
import { GetGoodsQueryDto } from './dto/get-goods-query.dto';
import { JwtGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Товары')
@ApiBearerAuth()
@Controller('goods')
@UseGuards(JwtGuard)
export class GoodsController {
  constructor(private readonly goodsService: GoodsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Получить список категорий' })
  @ApiResponse({ status: 200, description: 'Список категорий' })
  getCategories() {
    return this.goodsService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Создать категорию' })
  @ApiResponse({ status: 201, description: 'Категория создана' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.goodsService.createCategory(dto);
  }

  @Get('sizes')
  @ApiOperation({ summary: 'Получить список размеров' })
  @ApiResponse({ status: 200, description: 'Список размеров' })
  getSizes() {
    return this.goodsService.getSizes();
  }

  @Post('sizes')
  @ApiOperation({ summary: 'Создать размер' })
  @ApiResponse({ status: 201, description: 'Размер создан' })
  createSize(@Body() dto: CreateSizeDto) {
    return this.goodsService.createSize(dto);
  }

  @Post()
  @ApiOperation({
    summary: 'Создать товар',
    description:
      'Добавляет новый товар в магазин. Доступно только участникам магазина (OWNER, MANAGER).',
  })
  @ApiResponse({ status: 201, description: 'Товар создан' })
  @ApiResponse({
    status: 403,
    description: 'Нет прав на добавление в этот магазин',
  })
  @ApiResponse({ status: 404, description: 'Категория или размер не найдены' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateGoodDto) {
    return this.goodsService.createGood(userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список товаров',
    description:
      'Возвращает список товаров с фильтрацией по магазину, поиском и пагинацией.',
  })
  @ApiResponse({ status: 200, description: 'Список товаров получен' })
  getAll(@Query() query: GetGoodsQueryDto) {
    return this.goodsService.getAllGoods(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить товар по ID' })
  @ApiParam({ name: 'id', description: 'UUID товара' })
  @ApiResponse({ status: 200, description: 'Информация о товаре' })
  @ApiResponse({ status: 404, description: 'Товар не найден' })
  getOne(@Param('id') id: string) {
    return this.goodsService.getGoodById(id);
  }
}
