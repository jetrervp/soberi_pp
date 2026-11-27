import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponse {
  @ApiProperty({ example: 'Код подтверждения отправлен на почту' })
  message: string;
}