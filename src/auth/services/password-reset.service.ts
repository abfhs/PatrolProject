import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetToken } from '../entities/password-reset.entity';
import { UsersModel } from 'src/users/entities/users.entitys';
import { UsersService } from 'src/users/users.service';
import { EmailService } from './email.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { HASH_ROUNDS } from '../const/auth.const';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly passwordResetTokenRepository: Repository<PasswordResetToken>,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('해당 이메일로 등록된 계정이 없습니다.');
    }

    // 기존 미사용 토큰들 삭제
    await this.passwordResetTokenRepository.delete({
      userId: user.id,
      isUsed: false,
    });

    // 새 토큰 생성
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1시간 후 만료

    const passwordResetToken = this.passwordResetTokenRepository.create({
      token,
      userId: user.id,
      expiresAt,
      isUsed: false,
    });

    await this.passwordResetTokenRepository.save(passwordResetToken);

    // 이메일 발송
    await this.sendPasswordResetEmail(user, token);

    return {
      message: '비밀번호 재설정 링크가 이메일로 전송되었습니다.',
    };
  }

  async verifyPasswordResetToken(token: string): Promise<{ isValid: boolean; userId?: number }> {
    const passwordResetToken = await this.passwordResetTokenRepository.findOne({
      where: { token, isUsed: false },
      relations: ['user'],
    });

    if (!passwordResetToken) {
      return { isValid: false };
    }

    if (new Date() > passwordResetToken.expiresAt) {
      return { isValid: false };
    }

    return { isValid: true, userId: passwordResetToken.userId };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string; user?: { email: string; nickname: string } }> {
    const passwordResetToken = await this.passwordResetTokenRepository.findOne({
      where: { token, isUsed: false },
      relations: ['user'],
    });

    if (!passwordResetToken) {
      throw new BadRequestException('유효하지 않은 토큰입니다.');
    }

    if (new Date() > passwordResetToken.expiresAt) {
      throw new BadRequestException('만료된 토큰입니다.');
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(newPassword, HASH_ROUNDS);

    // 사용자 비밀번호 업데이트
    await this.usersService.updateUserPassword(passwordResetToken.userId, hashedPassword);

    // 토큰을 사용됨으로 표시
    passwordResetToken.isUsed = true;
    passwordResetToken.usedAt = new Date();
    await this.passwordResetTokenRepository.save(passwordResetToken);

    return {
      message: '비밀번호가 성공적으로 변경되었습니다.',
      user: {
        email: passwordResetToken.user.email,
        nickname: passwordResetToken.user.nickname,
      },
    };
  }

  private async sendPasswordResetEmail(user: UsersModel, token: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password-confirm?token=${token}`;
    
    console.log(`🔗 비밀번호 재설정 링크 생성: ${resetLink}`);

    const subject = '[Patrol] 비밀번호 재설정 요청';
    const html = `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Patrol</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-bottom: 20px;">비밀번호 재설정 요청</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            안녕하세요, <strong>${user.nickname}</strong>님!
          </p>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
            비밀번호 재설정 요청을 받았습니다. 아래 버튼을 클릭하여 새로운 비밀번호를 설정해주세요.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; background: #ffc107; color: #000; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              비밀번호 재설정하기
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px; line-height: 1.5; margin-top: 30px;">
            이 링크는 1시간 후에 만료됩니다.<br>
            만약 비밀번호 재설정을 요청하지 않으셨다면, 이 이메일을 무시하세요.
          </p>
          
          <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              링크가 작동하지 않는 경우 아래 URL을 복사하여 브라우저에 붙여넣어 주세요:<br>
              <span style="word-break: break-all;">${resetLink}</span>
            </p>
          </div>
        </div>
      </div>
    `;

    await this.emailService.sendEmail(user.email, subject, html);
  }
}