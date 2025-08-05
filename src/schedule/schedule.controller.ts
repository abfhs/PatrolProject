import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  HttpCode,
  HttpStatus,
  Put
} from '@nestjs/common';
import { ScheduleService, CreateScheduleDto } from './schedule.service';
import { AccessTokenGuard } from 'src/auth/guard/bearer-token.guard';
import { ScheduleModel } from './entities/schedule.entity';

@Controller('schedule')
@UseGuards(AccessTokenGuard) // 모든 엔드포인트에 인증 필요
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  /**
   * 새로운 스케줄 데이터 생성
   * POST /schedule
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createSchedule(@Body() createDto: CreateScheduleDto): Promise<ScheduleModel> {
    return await this.scheduleService.createSchedule(createDto);
  }

  /**
   * 모든 스케줄 데이터 조회
   * GET /schedule
   */
  @Get()
  async getAllSchedules(): Promise<ScheduleModel[]> {
    return await this.scheduleService.findAllSchedules();
  }

  /**
   * 특정 이메일의 스케줄 데이터 조회
   * GET /schedule/email/:email
   */
  @Get('email/:email')
  async getSchedulesByEmail(@Param('email') email: string): Promise<ScheduleModel[]> {
    return await this.scheduleService.findSchedulesByEmail(email);
  }

  /**
   * 스케줄 데이터 삭제
   * DELETE /schedule/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSchedule(@Param('id') id: string): Promise<void> {
    const scheduleId = parseInt(id, 10);
    if (isNaN(scheduleId)) {
      throw new Error('유효하지 않은 ID입니다.');
    }
    return await this.scheduleService.deleteSchedule(scheduleId);
  }

  /**
   * 테스트용 수동 스케줄 실행
   * POST /schedule/run-manual
   * 개발/테스트 목적으로 스케줄을 수동으로 실행
   */
  @Post('run-manual')
  @HttpCode(HttpStatus.OK)
  async runScheduleManually(): Promise<{ message: string }> {
    await this.scheduleService.runScheduleManually();
    return { message: '스케줄이 수동으로 실행되었습니다.' };
  }

  /**
   * 스케줄에 crawlResult 저장
   * PUT /schedule/:id/crawl-result
   */
  @Put(':id/crawl-result')
  @HttpCode(HttpStatus.OK)
  async saveCrawlResult(
    @Param('id') id: string,
    @Body('crawlResult') crawlResult: any
  ): Promise<ScheduleModel> {
    const scheduleId = parseInt(id, 10);
    if (isNaN(scheduleId)) {
      throw new Error('유효하지 않은 ID입니다.');
    }
    return await this.scheduleService.saveCrawlResult(scheduleId, crawlResult);
  }
}