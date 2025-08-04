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
      serveRoot: '/'
    }),
    TypeOrmModule.forRoot({
      //데이터베이스 타입
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [
        // PostsModel,
        UsersModel,
        ScheduleModel,
        TaskLog
      ],
      synchronize: true, // 배포 시에는 자동 연동되지 않도록 false로 세팅
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
