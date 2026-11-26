import { ConfigService } from '@nestjs/config';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailerOptions } from '@nestjs-modules/mailer';

export const getMailConfig = async (
  configService: ConfigService,
): Promise<MailerOptions> => {
  return {
    transport: {
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      auth: {
        user: 'soberistore@yandex.ru',
        pass: configService.getOrThrow<string>('MAIL_PASSWORD'), // сюда поместите пароль приложения
      },
    },
    defaults: {
      from: `"Собери" <soberistore@yandex.ru>`,
    },
    template: {
      adapter: new EjsAdapter(),
      options: { strict: false },
    },
  };
};