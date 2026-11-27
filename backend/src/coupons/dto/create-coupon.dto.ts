import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { DiscountType } from '@prisma/client';

export class CreateCouponDto {
  @ApiProperty({ example: 'SALE2026', description: 'Уникальный код купона' })
  @IsString()
  @MinLength(3)
  code: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({
    example: 10,
    description: 'Значение скидки (10% или 500 руб)',
  })
  @IsInt()
  @Min(1)
  discountValue: number;

  @ApiPropertyOptional({ example: 2000, description: 'Мин. сумма заказа' })
  @IsOptional()
  @IsInt()
  minOrderAmount?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Макс. кол-во использований',
  })
  @IsOptional()
  @IsInt()
  maxUses?: number;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59Z',
    description: 'Дата окончания',
  })
  @IsOptional()
  @IsString()
  validUntil?: string;
}
