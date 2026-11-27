import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { User as PrismaUser } from '@prisma/client';
import type { Request } from 'express';

export const Authorized = createParamDecorator(
  (data: keyof PrismaUser, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const user = request.user as PrismaUser | undefined;

    return data ? user?.[data] : user;
  },
);