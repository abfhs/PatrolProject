import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersModel } from '../../users/entities/users.entitys';
import { RolesEnum } from '../../users/const/roles.const';
import { HASH_ROUNDS } from '../../auth/const/auth.const';

@Injectable()
export class AdminUserSeed implements OnModuleInit {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepository: Repository<UsersModel>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createAdminUser();
  }

  private async createAdminUser() {
    try {
      // 환경변수에서 어드민 계정 정보 가져오기
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
      const adminNickname = this.configService.get<string>('ADMIN_NICKNAME');

      if (!adminEmail || !adminPassword || !adminNickname) {
        console.error('❌ Admin credentials not found in environment variables');
        console.error('   Please set ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_NICKNAME in .env file');
        return;
      }

      // 어드민 계정이 이미 존재하는지 확인
      const existingAdmin = await this.userRepository.findOne({
        where: { email: adminEmail },
      });

      if (existingAdmin) {
        console.log('🔑 Admin user already exists');
        // 기존 사용자의 role이 ADMIN이 아닌 경우 업데이트
        if (existingAdmin.role !== RolesEnum.ADMIN) {
          console.log('🔄 Updating existing user role to ADMIN');
          existingAdmin.role = RolesEnum.ADMIN;
          await this.userRepository.save(existingAdmin);
          console.log('✅ Admin user role updated successfully');
        }
        return;
      }

      // 비밀번호 해시화
      const hashedPassword = await bcrypt.hash(adminPassword, HASH_ROUNDS);

      // 어드민 사용자 생성
      const adminUser = this.userRepository.create({
        nickname: adminNickname,
        email: adminEmail,
        password: hashedPassword,
        role: RolesEnum.ADMIN,
      });

      await this.userRepository.save(adminUser);
      
      console.log('🚀 Admin user created successfully');
      console.log('   Email:', adminEmail);
      console.log('   Nickname:', adminNickname);
      console.log('   Role: ADMIN');
    } catch (error) {
      console.error('❌ Failed to create admin user:', error);
    }
  }
}