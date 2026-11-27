import { Module } from '@nestjs/common';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MinioModule } from '../common/minio/minio.module';

@Module({
  imports: [PrismaModule, MinioModule],
  controllers: [StoresController],
  providers: [StoresService],
})
export class StoresModule {}
