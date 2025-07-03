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
import { CrawlModule } from './crawl/crawl.module';

@Module({
  imports: [
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
        UsersModel
      ],
      synchronize: true, // 배포 시에는 자동 연동되지 않도록 false로 세팅
    }),
    AuthModule,
    UsersModule,
    CommonModule,
    CrawlModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
