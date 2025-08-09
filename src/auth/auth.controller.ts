import { Controller, Post, Body, Headers, UseGuards, Request, Res, Get, Param} from '@nestjs/common';
import { AuthService } from './auth.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { MaxLengthPipe, MinLengthPipe, PasswordPipe, FlexiblePasswordPipe } from './pipe/password.pipe';
import { BasicTokenGuard } from './guard/basic-token.guard';
import { AccessTokenGuard, RefreshTokenGuard } from './guard/bearer-token.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  @Post('token/access')
  @UseGuards(RefreshTokenGuard)
  postTokenAccess(@Headers('authorization') rawToken: string){
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token, false);

    /**
     * {accessToken: {token}} 
     */

    return {
      accessToken: newToken,
    }

  }

  @Post('token/refresh')
  @UseGuards(RefreshTokenGuard)
  postTokenRefresh(@Headers('authorization') rawToken: string){
    const token = this.authService.extractTokenFromHeader(rawToken, true);

    const newToken = this.authService.rotateToken(token, true);

    /**
     * {accessToken: {token}} 
     */

    return {
      refreshToken: newToken,
    }

  }

  @Post('login/email')
  @UseGuards(BasicTokenGuard)
  async postLoginEmail(
    @Headers('authorization') rawToken: string,
  ){
    // email: password -> base64
    const token = this.authService.extractTokenFromHeader(rawToken, false);
    const credentials = this.authService.decodeBasicToken(token);
    return this.authService.loginWithEmail(credentials);
  }

  @Post('register/email')
  postRegisterEmail(
    @Body('nickname') nickname: string,
    @Body('email') email: string,
    @Body('password', new MaxLengthPipe(8, '비밀번호'), new MinLengthPipe(3)) password: string,){
    return this.authService.registerWithEmail({
      nickname,
      email,
      password,
    })
  }

  // 이메일 인증을 위한 인증 메일 발송
  @Post('send-verification-email')
  @UseGuards(AccessTokenGuard)
  async sendVerificationEmail(@Request() req) {
    const userId = req.user.id;
    return this.emailVerificationService.sendVerificationEmail(userId);
  }

  // 이메일 인증 완료 처리
  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string, @Res() res: Response) {
    try {
      const result = await this.emailVerificationService.verifyEmail(token);
      
      // 인증 성공 시 프론트엔드로 리다이렉트 (성공 페이지)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/email-verification-success?message=${encodeURIComponent(result.message)}`);
    } catch (error) {
      // 인증 실패 시 프론트엔드로 리다이렉트 (실패 페이지)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/email-verification-error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // 사용자의 이메일 인증 상태 확인
  @Get('verification-status')
  @UseGuards(AccessTokenGuard)
  async getVerificationStatus(@Request() req) {
    const userId = req.user.id;
    return this.emailVerificationService.getVerificationStatus(userId);
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  async logout(@Request() req) {
    const userId = req.user.id;
    return this.authService.logout(userId);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    return this.passwordResetService.requestPasswordReset(email);
  }

  @Get('verify-reset-token/:token')
  async verifyResetToken(@Param('token') token: string) {
    return this.passwordResetService.verifyPasswordResetToken(token);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password', FlexiblePasswordPipe) password: string,
  ) {
    return this.passwordResetService.resetPassword(token, password);
  }
}
