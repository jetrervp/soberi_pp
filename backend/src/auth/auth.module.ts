import { Module, OnModuleInit } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJwtConfig } from '../configs/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '@nestjs-modules/mailer';
import { getMailConfig } from '../configs/mail.config';
import { OTPModule } from 'redis-otp-manager/nest';
import { RedisAdapter } from 'redis-otp-manager';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379'
});

redisClient.connect().catch((err) => {
  console.error('Redis connection error:', err);
});

@Module({
  imports: [
    OTPModule.forRoot({
      store: new RedisAdapter(redisClient as any),
      ttl: 600,
      maxAttempts: 5,
      resendCooldown: 60,
      rateLimit: { window: 60, max: 3 },
      devMode: true,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMailConfig,
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule implements OnModuleInit {
  async onModuleInit() {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  }
}