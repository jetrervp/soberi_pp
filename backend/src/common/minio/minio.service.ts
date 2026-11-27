import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class MinioService {
  constructor(
    @Inject('MINIO_CLIENT') private readonly minioClient: Client,
    private readonly configService: ConfigService,
  ) {}

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    if (!file) {
      throw new BadRequestException('Файл не передан');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Можно загружать только изображения');
    }

    const bucket = this.configService.getOrThrow<string>('MINIO_BUCKET');
    const ext = path.extname(file.originalname);
    const objectName = `${folder}/${randomUUID()}${ext}`;

    try {
      await this.minioClient.putObject(
        bucket,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );

      const endPoint = this.configService.getOrThrow<string>('MINIO_ENDPOINT');
      const port = this.configService.getOrThrow<string>('MINIO_PORT');

      return `http://${endPoint}:${port}/${bucket}/${objectName}`;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Ошибка при загрузке файла в MinIO');
    }
  }
}
