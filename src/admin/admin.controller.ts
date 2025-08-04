import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Query
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminGuard } from '../auth/guard/admin.guard';
import { UsersModel } from '../users/entities/users.entitys';
import { ScheduleModel } from '../schedule/entities/schedule.entity';

@Controller('admin')
@UseGuards(AdminGuard) // 모든 엔드포인트에 어드민 권한 필요
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 어드민 대시보드 정보
  @Get('dashboard')
  async getDashboard() {
    return await this.adminService.getDashboardStats();
  }

  // 모든 사용자 조회
  @Get('users')
  async getAllUsers(): Promise<UsersModel[]> {
    return await this.adminService.getAllUsers();
  }

  // 사용자 삭제
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string): Promise<void> {
    const userId = parseInt(id, 10);
    return await this.adminService.deleteUser(userId);
  }

  // 모든 스케줄 조회
  @Get('schedules')
  async getAllSchedules(): Promise<ScheduleModel[]> {
    return await this.adminService.getAllSchedules();
  }

  // 스케줄 삭제
  @Delete('schedules/:id')
  async deleteSchedule(@Param('id') id: string): Promise<void> {
    const scheduleId = parseInt(id, 10);
    return await this.adminService.deleteSchedule(scheduleId);
  }

  // 스케줄러 수동 실행
  @Post('scheduler/run')
  async runScheduler(): Promise<{ message: string }> {
    return await this.adminService.runScheduler();
  }

  // 스케줄러 로그 조회
  @Get('scheduler/logs')
  async getSchedulerLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('date') date?: string
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    return await this.adminService.getSchedulerLogs(pageNum, limitNum, date);
  }

  // 스케줄러 통계 조회
  @Get('scheduler/stats')
  async getSchedulerStats(@Query('days') days: string = '30') {
    const daysNum = parseInt(days, 10);
    return await this.adminService.getSchedulerStats(daysNum);
  }
}