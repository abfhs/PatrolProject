import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { UsersModel } from './users/entities/users.entitys';
import { ScheduleModel } from './schedule/entities/schedule.entity';
import { TaskLog } from './schedule/entities/task-log.entity';
import { EmailVerification } from './auth/entities/email-verification.entity';
import { CrawlModule } from './crawl/crawl.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AdminModule } from './admin/admin.module';
import { ConfigModule } from '@nestjs/config';
import { AdminUserSeed } from './database/seeds/admin-user.seed';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
      exclude: ['/api*'], // API 경로는 제외
      renderPath: '*', // SPA를 위한 모든 경로를 index.html로 리다이렉트
    }),
    TypeOrmModule.forRoot({
      //데이터베이스 타입
      type: 'postgres',
      host: process.env.DATABASE_HOST || '127.0.0.1',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'postgres',
      entities: [
        // PostsModel,
        UsersModel,
        ScheduleModel,
        TaskLog,
        EmailVerification
      ],
      synchronize: true, // 임시로 테이블 생성을 위해 활성화
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false, // RDS SSL 연결
    }),
    TypeOrmModule.forFeature([UsersModel]), // AdminUserSeed에서 사용
    AuthModule,
    UsersModule,
    CommonModule,
    CrawlModule,
    ScheduleModule,
    AdminModule
  ],
  controllers: [AppController],
  providers: [AppService, AdminUserSeed],
})
export class AppModule {}
