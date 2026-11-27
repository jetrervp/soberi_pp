import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Req,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import { RequestCodeRequest } from './dto/request-code.dto';
import { VerifyEmailRequest } from './dto/verify-email.dto';
import { AuthResponse } from './dto/auth.dto';

import type { Request, Response } from 'express';

import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Создание аккаунта',
    description: 'Создаёт новый аккаунт пользователя.',
  })
  @ApiOkResponse({
    description: 'Аккаунт создан, код подтверждения отправлен на почту.',
  })
  @ApiBadRequestResponse({
    description: 'Некорректные входные данные.',
  })
  @ApiConflictResponse({
    description: 'Пользователь с такой почтой уже существует.',
  })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterRequest) {
    return this.authService.register(dto);
  }

  @ApiOperation({
    summary: 'Повторная отправка кода подтверждения',
    description: 'Отправляет новый 6-значный код на почту.',
  })
  @ApiOkResponse({
    description: 'Код подтверждения отправлен повторно.',
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден.',
  })
  @ApiBadRequestResponse({
    description: 'Почта уже подтверждена или превышен лимит запросов.',
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь заблокирован.',
  })
  @Post('resend-code')
  @HttpCode(HttpStatus.OK)
  async resendCode(@Body() dto: RequestCodeRequest) {
    return this.authService.resendVerificationCode(dto.email);
  }

  @ApiOperation({
    summary: 'Подтверждение электронной почты',
    description:
      'Проверяет OTP-код, отправленный на почту пользователя, и подтверждает его аккаунт.',
  })
  @ApiBody({
    type: VerifyEmailRequest,
  })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'Почта успешно подтверждена, пользователь авторизован.',
  })
  @ApiBadRequestResponse({
    description: 'Неверный или просроченный код. Почта уже подтверждена.',
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден.',
  })
  @ApiUnauthorizedResponse({
    description: 'Пользователь заблокирован.',
  })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: VerifyEmailRequest,
  ) {
    return this.authService.verifyEmail(res, dto);
  }

  @ApiOperation({
    summary: 'Вход в систему',
    description: 'Авторизует пользователя и выдаёт токен доступа.',
  })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'Пользователь успешно авторизован.',
  })
  @ApiBadRequestResponse({
    description: 'Некорректные входные данные.',
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Неверный пароль, почта не подтверждена или пользователь заблокирован.',
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginRequest,
  ) {
    return this.authService.login(res, dto);
  }

  @ApiOperation({
    summary: 'Обновление токена',
    description: 'Генерирует новый токен доступа.',
  })
  @ApiOkResponse({
    type: AuthResponse,
    description: 'Токен успешно обновлён.',
  })
  @ApiUnauthorizedResponse({
    description: 'Недействительный refresh-токен или почта не подтверждена.',
  })
  @ApiNotFoundResponse({
    description: 'Пользователь не найден.',
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(req, res);
  }

  @ApiOperation({
    summary: 'Выход из системы',
    description: 'Завершает пользовательскую сессию.',
  })
  @ApiOkResponse({
    description: 'Пользователь успешно вышел из системы.',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}
