import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class GoodSizeDto {
  @ApiProperty({ description: 'ID размера из таблицы Size' })
  @IsString()
  @IsNotEmpty()
  sizeId: string;

  @ApiProperty({
    description: 'Количество на складе для этого размера',
    example: 10,
  })
  @IsInt()
  @Min(0)
  stock: number;
}

export class CreateGoodDto {
  @ApiProperty({ description: 'ID магазина, к которому относится товар' })
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ description: 'ID категории' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'Футболка оверсайз' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Хлопок 100%, универсальный крой' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1990, description: 'Цена в копейках или рублях' })
  @IsInt()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Активен ли товар для показа',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: [GoodSizeDto],
    description: 'Размеры и остатки на складе',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodSizeDto)
  sizes?: GoodSizeDto[];
}
