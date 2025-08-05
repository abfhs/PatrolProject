import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerification } from '../entities/email-verification.entity';
import { EmailService } from './email.service';
import { UsersService } from '../../users/users.service';
import { RolesEnum } from '../../users/const/roles.const';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  async sendVerificationEmail(userId: number): Promise<{ message: string }> {
    // 사용자 조회
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // USER 역할인지 확인
    if (user.role !== RolesEnum.USER) {
      throw new BadRequestException('이미 인증된 사용자이거나 인증이 필요하지 않습니다.');
    }

    // 기존 미인증 토큰이 있다면 삭제
    await this.emailVerificationRepository.delete({
      userId,
      isVerified: false,
    });

    // 새 인증 토큰 생성
    const verificationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24시간 후 만료

    const emailVerification = this.emailVerificationRepository.create({
      userId,
      email: user.email,
      verificationToken,
      expiresAt,
    });

    await this.emailVerificationRepository.save(emailVerification);

    // 이메일 발송
    const emailSent = await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken
    );

    if (!emailSent) {
      throw new BadRequestException('이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }

    return {
      message: '인증 이메일이 발송되었습니다. 이메일을 확인해주세요.',
    };
  }

  async verifyEmail(token: string): Promise<{ message: string; user: any }> {
    // 토큰으로 인증 정보 조회
    const verification = await this.emailVerificationRepository.findOne({
      where: { verificationToken: token },
      relations: ['user'],
    });

    if (!verification) {
      throw new NotFoundException('유효하지 않은 인증 토큰입니다.');
    }

    // 만료 시간 확인
    if (new Date() > verification.expiresAt) {
      throw new BadRequestException('인증 토큰이 만료되었습니다. 새로운 인증 이메일을 요청해주세요.');
    }

    // 이미 인증된 토큰인지 확인
    if (verification.isVerified) {
      throw new BadRequestException('이미 사용된 인증 토큰입니다.');
    }

    // 사용자 역할 업데이트 (USER → MEMBER)
    await this.usersService.updateUserRole(verification.userId, RolesEnum.MEMBER);

    // 인증 완료 표시
    verification.isVerified = true;
    await this.emailVerificationRepository.save(verification);

    console.log(`✅ 이메일 인증 완료: ${verification.email} (USER → MEMBER)`);

    return {
      message: '이메일 인증이 완료되었습니다! 이제 등기정보 스케줄 등록이 가능합니다.',
      user: {
        id: verification.user.id,
        email: verification.user.email,
        nickname: verification.user.nickname,
        role: RolesEnum.MEMBER,
      },
    };
  }

  // 사용자의 인증 상태 확인
  async getVerificationStatus(userId: number): Promise<{
    isVerified: boolean;
    hasActiveToken: boolean;
    expiresAt?: Date;
  }> {
    const user = await this.usersService.getUserById(userId);
    
    if (user.role === RolesEnum.MEMBER || user.role === RolesEnum.ADMIN) {
      return { isVerified: true, hasActiveToken: false };
    }

    const activeVerification = await this.emailVerificationRepository.findOne({
      where: {
        userId,
        isVerified: false,
      },
    });

    // 만료되지 않은 토큰인지 확인
    if (activeVerification && new Date() > activeVerification.expiresAt) {
      return { isVerified: false, hasActiveToken: false };
    }

    return {
      isVerified: false,
      hasActiveToken: !!activeVerification,
      expiresAt: activeVerification?.expiresAt,
    };
  }
}