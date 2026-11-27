import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Shop Builder API')
    .setDescription('API документация конструктора интернет-магазинов')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
}
