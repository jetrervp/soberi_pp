import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({
    example: 'Мой магазин одежды',
    description: 'Название магазина',
  })
  @IsString()
  @IsNotEmpty({ message: 'Название не может быть пустым' })
  @MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Название не должно превышать 100 символов' })
  name: string;

  @ApiPropertyOptional({
    example: 'my-clothes-store',
    description:
      'URL-идентификатор (если не указан, сгенерируется автоматически)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug может содержать только строчные буквы, цифры и дефисы',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Мы продаем лучшую одежду в городе',
    description: 'Краткое описание',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Описание не должно превышать 500 символов' })
  description?: string;

  @ApiPropertyOptional({
    example: '+79991234567',
    description: 'Контактный телефон',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, { message: 'Некорректный формат телефона' })
  phone?: string;

  @ApiPropertyOptional({
    example: 'г. Москва, ул. Ленина, д. 1',
    description: 'Адрес магазина',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/logo.png',
    description: 'Ссылка на логотип',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Некорректный URL логотипа' })
  logoUrl?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/banner.jpg',
    description: 'Ссылка на баннер',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Некорректный URL баннера' })
  bannerUrl?: string;
}
