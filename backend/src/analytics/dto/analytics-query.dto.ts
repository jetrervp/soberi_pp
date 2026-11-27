import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    example: '2026-11-01T00:00:00Z',
    description: 'Начало периода',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-11-30T23:59:59Z',
    description: 'Конец периода',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
