import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from './services/email.service';
import { EmailVerificationService } from './services/email-verification.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { EmailVerification } from './entities/email-verification.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([EmailVerification]),
    JwtModule.register({}),
    UsersModule,
  ],
  exports:[AuthService, EmailService, EmailVerificationService],
  controllers: [AuthController],
  providers: [AuthService, EmailService, EmailVerificationService],
})
export class AuthModule {}
