import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { CrawlService } from './crawl.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { Response } from 'express';

@Controller('crawl')
export class CrawlController {
  constructor(private readonly crawlService: CrawlService) {}

  @Get('main')
  @UseGuards(AccessTokenGuard)
  getUsersMain(
    @Res() res: Response // 응답 객체 주입
  ){
    res.redirect(302, '/main.html');
  }

  @Post()
  @UseGuards(AccessTokenGuard)
  jusoChuri(
    @Body('address') address: string,
    @Body('name') name: string,
  ){
    return this.crawlService.churiProcess(
      address, name
    )
  }
}
