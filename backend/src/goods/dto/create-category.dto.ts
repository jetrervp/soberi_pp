import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Одежда' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'uuid-родительской-категории',
    description: 'ID родителя, если это подкатегория',
  })
  @IsOptional()
  @IsString()
  parentId?: string;
}
