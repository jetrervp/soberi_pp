import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import type { JwtPayload } from './interfaces/jwt.interface';
import type { Request, Response } from 'express';
import { isDev } from '../utils/is-dev.util';
import { MailerService } from '@nestjs-modules/mailer';
import { RegisterRequest } from './dto/register.dto';
import { LoginRequest } from './dto/login.dto';
import { VerifyEmailRequest } from './dto/verify-email.dto';
import { InjectOTPManager } from 'redis-otp-manager/nest';
import { OTPManager } from 'redis-otp-manager';

type JwtExpiresIn = NonNullable<JwtSignOptions['expiresIn']>;

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: JwtExpiresIn;
  private readonly JWT_REFRESH_TOKEN_TTL: JwtExpiresIn;
  private readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    @InjectOTPManager() private readonly otpManager: OTPManager,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow<JwtExpiresIn>(
      'JWT_ACCESS_TOKEN_TTL',
    );
    this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow<JwtExpiresIn>(
      'JWT_REFRESH_TOKEN_TTL',
    );
    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
  }

  async register(dto: RegisterRequest) {
    const { name, email, password } = dto;

    const existUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existUser) {
      throw new ConflictException('Пользователь с такой почтой уже существует');
    }

    await this.prismaService.user.create({
      data: {
        name,
        email,
        password: await hash(password),
        emailVerified: false,
      },
    });

    await this.sendVerificationCode(email);

    return { message: 'Код подтверждения отправлен на почту' };
  }

  async verifyEmail(res: Response, dto: VerifyEmailRequest) {
    const { email, code } = dto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerified: true,
        isBlocked: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Пользователь заблокирован');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Почта уже подтверждена');
    }

    await this.checkVerificationCode(email, code);

    await this.prismaService.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    return this.auth(res, user.id);
  }

  async resendVerificationCode(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: { emailVerified: true, isBlocked: true },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Пользователь заблокирован');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Почта уже подтверждена');
    }

    await this.sendVerificationCode(email);

    return { message: 'Код подтверждения отправлен повторно' };
  }

  async login(res: Response, dto: LoginRequest) {
    const { email, password } = dto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        emailVerified: true,
        isBlocked: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Пользователь заблокирован');
    }

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!user.emailVerified) {
      await this.sendVerificationCode(email);

      throw new UnauthorizedException(
        'Почта не подтверждена. Код подтверждения отправлен повторно.',
      );
    }

    return this.auth(res, user.id);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Недействительный refresh-токен');
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Недействительный refresh-токен');
    }

    if (!payload?.id) {
      throw new UnauthorizedException('Недействительный refresh-токен');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        isBlocked: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Пользователь заблокирован');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Почта не подтверждена');
    }

    return this.auth(res, user.id);
  }

  async logout(res: Response) {
    this.setCookie(res, 'refreshToken', new Date(0));

    return true;
  }

  async validate(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (user.isBlocked) {
      throw new UnauthorizedException('Пользователь заблокирован');
    }

    return user;
  }

  private async sendVerificationCode(email: string) {
  const { otp } = await this.otpManager.generate({
    type: 'email',
    identifier: email,
    intent: 'verify-email',
  });

  if (!otp) {
    throw new Error('Не удалось получить OTP');
  }

  await this.mailerService.sendMail({
    to: email,
    subject: 'Код подтверждения почты',
    text: `Ваш код подтверждения: ${otp}. Код действует 10 минут.`,
    html: `
      <p>Ваш код подтверждения: <b>${otp}</b></p>
      <p>Код действует 10 минут.</p>
    `,
  });



    await this.mailerService.sendMail({
      to: email,
      subject: 'Код подтверждения почты',
      text: `Ваш код подтверждения: ${otp}. Код действует 10 минут.`,
      html: `
        <p>Ваш код подтверждения: <b>${otp}</b></p>
        <p>Код действует 10 минут.</p>
      `,
    });
  }

  private async checkVerificationCode(email: string, code: string) {
    try {
      await this.otpManager.verify({
        type: 'email',
        identifier: email,
        intent: 'verify-email',
        otp: code,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Неверный или истёкший код';

      throw new BadRequestException(message);
    }
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id);

    this.setCookie(
      res,
      refreshToken,
      new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    );

    return { accessToken };
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'none' : 'lax',
    });
  }
}