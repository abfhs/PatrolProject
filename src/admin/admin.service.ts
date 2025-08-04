import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UsersModel } from '../users/entities/users.entitys';
import { ScheduleModel } from '../schedule/entities/schedule.entity';
import { TaskLog } from '../schedule/entities/task-log.entity';
import { ScheduleService } from '../schedule/schedule.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UsersModel)
    private readonly userRepository: Repository<UsersModel>,
    @InjectRepository(ScheduleModel)
    private readonly scheduleRepository: Repository<ScheduleModel>,
    @InjectRepository(TaskLog)
    private readonly taskLogRepository: Repository<TaskLog>,
    private readonly scheduleService: ScheduleService,
  ) {}

  // 대시보드 통계 정보
  async getDashboardStats() {
    const [userCount, scheduleCount] = await Promise.all([
      this.userRepository.count(),
      this.scheduleRepository.count(),
    ]);

    // 최근 7일 간의 통계 (향후 TaskLog 구현 후 추가)
    const recentStats = {
      totalUsers: userCount,
      totalSchedules: scheduleCount,
      // TODO: TaskLog 구현 후 추가
      // successfulTasks: 0,
      // failedTasks: 0,
    };

    return recentStats;
  }

  // 모든 사용자 조회
  async getAllUsers(): Promise<UsersModel[]> {
    return await this.userRepository.find({
      select: ['id', 'nickname', 'email', 'role', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
  }

  // 사용자 삭제
  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 어드민 사용자는 삭제 불가
    if (user.email === 'superuser@admin.com') {
      throw new BadRequestException('어드민 사용자는 삭제할 수 없습니다.');
    }

    await this.userRepository.delete(userId);
  }

  // 모든 스케줄 조회
  async getAllSchedules(): Promise<ScheduleModel[]> {
    return await this.scheduleRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // 스케줄 삭제
  async deleteSchedule(scheduleId: number): Promise<void> {
    const result = await this.scheduleRepository.delete(scheduleId);
    
    if (result.affected === 0) {
      throw new NotFoundException('스케줄을 찾을 수 없습니다.');
    }
  }

  // 스케줄러 수동 실행
  async runScheduler(): Promise<{ message: string }> {
    try {
      await this.scheduleService.runScheduleManually();
      return { message: '스케줄러가 성공적으로 실행되었습니다.' };
    } catch (error) {
      throw new BadRequestException('스케줄러 실행 중 오류가 발생했습니다.');
    }
  }

  // 스케줄러 로그 조회
  async getSchedulerLogs(page: number, limit: number, date?: string) {
    return await this.scheduleService.getTaskLogs(page, limit, date);
  }

  // 스케줄러 통계 조회
  async getSchedulerStats(days: number) {
    return await this.scheduleService.getTaskLogStats(days);
  }
}