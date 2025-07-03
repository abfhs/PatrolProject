import { Module } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { CrawlController } from './crawl.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[
      JwtModule.register({}),
      UsersModule,
      AuthModule,
    ],
  exports:[CrawlService],
  controllers: [CrawlController],
  providers: [CrawlService],
})
export class CrawlModule {}
