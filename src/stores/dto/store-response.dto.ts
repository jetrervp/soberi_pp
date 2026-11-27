import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoreResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Мой магазин одежды' })
  name: string;

  @ApiProperty({ example: 'my-clothes-store' })
  slug: string;

  @ApiPropertyOptional({ example: 'Мы продаем лучшую одежду' })
  description?: string;

  @ApiProperty({ example: 'DRAFT' })
  status: string;

  @ApiProperty({ example: '2026-11-25T20:00:00.000Z' })
  createdAt: Date;
}
