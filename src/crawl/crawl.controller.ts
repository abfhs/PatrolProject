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

  @Post('find')
  @UseGuards(AccessTokenGuard)
  findAddress(
    @Body('address') address: string,
  ){
    return this.crawlService.findAddress(
      address
    )
  }

  @Post('findProcess')
  @UseGuards(AccessTokenGuard)
  findProcess(
    @Body('real_indi_cont_detail') real_indi_cont_detail: string,
    @Body('crypted_id') crypted_id: string,
    @Body('id') id: string,
    @Body('cookieString') cookieString: string,
    @Body('pin') pin: string,
  ){
    return this.crawlService.findProcess(
      real_indi_cont_detail, crypted_id, id, cookieString, pin
    )
  }

  @Post('checkProcess')
  @UseGuards(AccessTokenGuard)
  checkProcess(
    @Body('real_indi_cont_detail') real_indi_cont_detail: string,
    @Body('crypted_id') crypted_id: string,
    @Body('id') id: string,
    @Body('cookieString') cookieString: string,
    @Body('pin') pin: string,
    @Body('name') name: string,
  ){
    return this.crawlService.checkProcess(
      real_indi_cont_detail, crypted_id, id, cookieString, pin, name
    )
  }




}
