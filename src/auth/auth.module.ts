import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from './services/email.service';
import { EmailVerificationService } from './services/email-verification.service';
import { PasswordResetService } from './services/password-reset.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { EmailVerification } from './entities/email-verification.entity';
import { PasswordResetToken } from './entities/password-reset.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([EmailVerification, PasswordResetToken]),
    JwtModule.register({}),
    UsersModule,
  ],
  exports:[AuthService, EmailService, EmailVerificationService, PasswordResetService],
  controllers: [AuthController],
  providers: [AuthService, EmailService, EmailVerificationService, PasswordResetService],
})
export class AuthModule {}
