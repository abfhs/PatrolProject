import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { AccessTokenGuard } from './bearer-token.guard';
import { RolesEnum } from '../../users/const/roles.const';

@Injectable()
export class AdminGuard extends AccessTokenGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 먼저 기본 인증 확인
    const authenticated = await super.canActivate(context);
    
    if (!authenticated) {
      return false;
    }

    // 요청 객체에서 사용자 정보 가져오기
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 어드민 역할 확인
    if (!user || user.role !== RolesEnum.ADMIN) {
      throw new ForbiddenException('관리자 권한이 필요합니다.');
    }

    return true;
  }
}