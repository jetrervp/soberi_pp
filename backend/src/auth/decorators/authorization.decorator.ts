import { applyDecorators, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../../common/guards/auth.guard";

export function Authorization(){
    return applyDecorators(UseGuards(JwtGuard));
}