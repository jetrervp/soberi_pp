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
import { FileFieldsInterceptor } from '@nestjs/platform-express'; // <-- Добавлен импорт
import { CreateStoreDto } from './dto/create-store.dto';
import { StoresService } from './stores.service';
import { JwtGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateStoreDto } from './dto/update-store.dto';

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
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateStoreDto,
    @UploadedFiles()
    files: { logo?: Express.Multer.File[]; banner?: Express.Multer.File[] },
  ) {
    return this.storesService.createStore(userId, dto, files);
  }

  @Delete(':id')
  deleteStore(@CurrentUser('id') userId: string, @Param('id') storeId: string) {
    return this.storesService.deleteStore(userId, storeId);
  }

  @Patch(':id')
  updateStore(
    @CurrentUser('id') userId: string,
    @Param('id') storeId: string,
    @Body() dto: UpdateStoreDto,
  ) {
    return this.storesService.updateStore(userId, storeId, dto);
  }

  @Get('my')
  getMyStores(@CurrentUser('id') userId: string) {
    return this.storesService.getMyStores(userId);
  }

  @Get(':id')
  getStoreById(
    @CurrentUser('id') userId: string,
    @Param('id') storeId: string,
  ) {
    return this.storesService.getStoreById(userId, storeId);
  }
}
