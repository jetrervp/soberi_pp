import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class AddManagerDto {
  @ApiProperty({ example: 'manager@example.com' })
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty()
  email: string;
}
