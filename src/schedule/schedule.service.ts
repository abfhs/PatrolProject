import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduleModel } from './entities/schedule.entity';
import { TaskLog, TaskStatus } from './entities/task-log.entity';
import { CrawlService } from '../crawl/crawl.service';
import { EmailService } from '../auth/services/email.service';

export interface CreateScheduleDto {
  addressPin: string;
  ownerName: string;
  email: string;
  address: string;
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleModel)
    private readonly scheduleRepository: Repository<ScheduleModel>,
    @InjectRepository(TaskLog)
    private readonly taskLogRepository: Repository<TaskLog>,
    private readonly crawlService: CrawlService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * CRUD 기능들
   */

  // 새로운 스케줄 데이터 생성
  async createSchedule(createDto: CreateScheduleDto): Promise<ScheduleModel> {
    try {
      // 중복 체크 (같은 addressPin + email 조합)
      const existingSchedule = await this.scheduleRepository.findOne({
        where: {
          addressPin: createDto.addressPin,
          email: createDto.email,
        },
      });

      if (existingSchedule) {
        throw new ConflictException('이미 등록된 주소핀과 이메일 조합입니다.');
      }

      // 새 스케줄 생성
      const schedule = this.scheduleRepository.create(createDto);
      const savedSchedule = await this.scheduleRepository.save(schedule);
      
      console.log('새로운 스케줄이 생성되었습니다:', {
        id: savedSchedule.id,
        addressPin: savedSchedule.addressPin,
        email: savedSchedule.email,
      });

      return savedSchedule;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('스케줄 생성 중 오류가 발생했습니다.');
    }
  }

  // 모든 스케줄 데이터 조회
  async findAllSchedules(): Promise<ScheduleModel[]> {
    return await this.scheduleRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  // 특정 이메일의 스케줄 데이터 조회
  async findSchedulesByEmail(email: string): Promise<ScheduleModel[]> {
    return await this.scheduleRepository.find({
      where: { email },
      order: { createdAt: 'DESC' },
    });
  }

  // 스케줄 데이터 삭제
  async deleteSchedule(id: number): Promise<void> {
    const result = await this.scheduleRepository.delete(id);
    if (result.affected === 0) {
      throw new BadRequestException('삭제할 스케줄을 찾을 수 없습니다.');
    }
  }

  /**
   * 스케줄링 기능들
   */

  // 매일 오전 11시에 실행되는 스케줄러
  @Cron('0 11 * * *', {
    name: 'dailyScheduleTask',
    timeZone: 'Asia/Seoul', // 한국 시간 기준
  })
  async handleScheduledTask() {
    await this.runScheduleWithLogging('daily-schedule-task');
  }

  // 로그와 함께 스케줄 실행
  async runScheduleWithLogging(taskName: string = 'manual-schedule-task') {
    const startTime = new Date();
    
    // 작업 로그 생성
    const taskLog = this.taskLogRepository.create({
      taskName,
      status: TaskStatus.RUNNING,
      startTime,
    });
    
    const savedLog = await this.taskLogRepository.save(taskLog);
    
    console.log(`=== ${taskName} 시작 (로그 ID: ${savedLog.id}) ===`);
    
    let processedCount = 0;
    let successCount = 0;
    let failureCount = 0;
    let resultData: any = {};
    
    try {
      // 모든 스케줄 데이터 조회
      const schedules = await this.findAllSchedules();
      
      if (schedules.length === 0) {
        console.log('처리할 스케줄 데이터가 없습니다.');
        resultData = { message: '처리할 스케줄 데이터가 없습니다.' };
      } else {
        console.log(`총 ${schedules.length}개의 스케줄 데이터를 처리합니다.`);
        processedCount = schedules.length;

        // 각 스케줄 데이터에 대해 작업 실행
        for (const schedule of schedules) {
          try {
            await this.processScheduleItem(schedule);
            successCount++;
          } catch (error) {
            console.error(`스케줄 ID ${schedule.id} 처리 실패:`, error);
            failureCount++;
          }
        }

        resultData = {
          totalSchedules: schedules.length,
          processed: processedCount,
          successful: successCount,
          failed: failureCount,
          scheduleIds: schedules.map(s => s.id),
        };
      }

      // 성공으로 로그 업데이트
      const endTime = new Date();
      await this.taskLogRepository.update(savedLog.id, {
        status: TaskStatus.SUCCESS,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        result: JSON.stringify(resultData),
        processedCount,
        successCount,
        failureCount,
      });

      console.log(`=== ${taskName} 완료 (성공: ${successCount}, 실패: ${failureCount}) ===`);
      
    } catch (error) {
      // 실패로 로그 업데이트
      const endTime = new Date();
      await this.taskLogRepository.update(savedLog.id, {
        status: TaskStatus.FAILED,
        endTime,
        duration: endTime.getTime() - startTime.getTime(),
        error: error.message || String(error),
        processedCount,
        successCount,
        failureCount,
      });

      console.error(`=== ${taskName} 실패 ===`, error);
      throw error;
    }
  }

  // 개별 스케줄 아이템 처리
  private async processScheduleItem(schedule: ScheduleModel): Promise<void> {
    try {
      console.log(`처리 중: ${schedule.email} - ${schedule.address}`);

      // 1. CrawlService의 getLogin 함수를 먼저 실행하여 로그인 세션 확보
      console.log('🔐 등기소 로그인 세션 확보 중...');
      const loginData = await this.crawlService.getLogin();
      
      console.log('✅ 로그인 성공:', {
        id: loginData.id,
        crypted_id: loginData.crypted_id ? '***' : null, // 보안상 마스킹
      });

      await this.executeCustomTask(loginData, schedule);
      
      console.log(`처리 완료: ${schedule.email}`);
    } catch (error) {
      console.error(`처리 실패: ${schedule.email}`, error);
    }
  }

  /**
   * 실제 작업 함수 - CrawlService를 사용하여 등기정보 조회
   */
  private async executeCustomTask(
    loginData: {
      id: string,
      crypted_id: string,
      cookieString: string,
    },
     schedule: ScheduleModel 
  ): Promise<void>{
    try {
      console.log('작업 실행:', {
        addressPin: schedule.addressPin,
        ownerName: schedule.ownerName,
        email: schedule.email,
        address: schedule.address,
      });

      // 2. 로그인 정보를 사용하여 등기정보 조회
      console.log('📋 등기정보 조회 중...');
      const crawlResult = await this.crawlService.getChuriData(
        loginData.id,
        loginData.crypted_id,
        loginData.cookieString,
        schedule.addressPin,
        schedule.ownerName,
        schedule.address
      );

      console.log('✅ 등기정보 조회 완료:', {
        scheduleId: schedule.id,
        email: schedule.email,
        resultKeys: Object.keys(crawlResult || {}),
      });

      // 3. 이전 조회 결과와 비교 및 변경사항 감지
      await this.processRegistrationChange(schedule, crawlResult);

      console.log('🎉 작업 완료');
      
    } catch (error) {
      console.error('❌ 작업 실행 중 오류 발생:', error);
      throw error; // 상위에서 실패로 처리되도록 오류를 다시 던짐
    }
  }

  /**
   * 등기정보 변경사항 처리 함수
   */
  private async processRegistrationChange(schedule: ScheduleModel, newCrawlResult: any): Promise<void> {
    try {
      console.log(`🔍 등기정보 변경사항 검사 시작: ${schedule.email} - ${schedule.address}`);

      // DB에 저장된 이전 크롤링 결과 가져오기
      const previousCrawlResult = schedule.crawlResult;

      if (!previousCrawlResult) {
        // 최초 실행인 경우 - DB에 결과 저장하고 성공 처리
        console.log('📝 최초 크롤링 결과 저장 중...');
        await this.updateScheduleCrawlResult(schedule.id, newCrawlResult);
        console.log('✅ 최초 크롤링 결과 저장 완료');
        return;
      }

      // 이전 결과와 새 결과 비교
      const isDataSame = this.compareRegistrationData(previousCrawlResult, newCrawlResult);

      if (isDataSame) {
        // 변경사항 없음 - 성공 처리
        console.log('✅ 등기정보 변경사항 없음 - 정상 처리');
        // DB의 최신 조회 시간 업데이트를 위해 결과 저장
        await this.updateScheduleCrawlResult(schedule.id, newCrawlResult);
      } else {
        // 변경사항 발견 - 알림 이메일 발송 및 실패 처리
        console.log('🚨 등기정보 변경사항 감지!');
        console.log('이전 데이터:', JSON.stringify(this.removeVolatileFields(previousCrawlResult), null, 2));
        console.log('새로운 데이터:', JSON.stringify(this.removeVolatileFields(newCrawlResult), null, 2));

        // 변경된 결과를 DB에 저장
        await this.updateScheduleCrawlResult(schedule.id, newCrawlResult);

        // 이메일 알림 발송
        await this.sendRegistrationChangeNotification(schedule, newCrawlResult);

        // 변경사항 발견으로 실패 처리 (로그에서 확인 가능)
        throw new Error(`등기정보 변경사항 감지: ${schedule.address}`);
      }

    } catch (error) {
      console.error('❌ 등기정보 변경사항 처리 중 오류:', error);
      throw error;
    }
  }

  // 스케줄의 크롤링 결과 업데이트
  private async updateScheduleCrawlResult(scheduleId: number, crawlResult: any): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({ where: { id: scheduleId } });
    if (schedule) {
      schedule.crawlResult = crawlResult;
      await this.scheduleRepository.save(schedule);
    }
  }

  // 등기정보 변경 알림 이메일 발송
  private async sendRegistrationChangeNotification(schedule: ScheduleModel, changedData: any): Promise<void> {
    try {
      const scheduleData = {
        address: schedule.address,
        addressPin: schedule.addressPin,
        ownerName: schedule.ownerName,
      };

      const emailSent = await this.emailService.sendRegistrationChangeAlert(
        schedule.email,
        scheduleData,
        changedData
      );

      if (emailSent) {
        console.log(`✅ 등기정보 변경 알림 이메일 발송 성공: ${schedule.email}`);
      } else {
        console.error(`❌ 등기정보 변경 알림 이메일 발송 실패: ${schedule.email}`);
      }
    } catch (error) {
      console.error('등기정보 변경 알림 이메일 발송 중 오류:', error);
      // 이메일 발송 실패해도 메인 프로세스는 계속 진행
    }
  }

  /**
   * 등기정보 비교 유틸리티 함수들
   */
  
  // id와 timestamp를 제외하고 객체 비교
  private compareRegistrationData(dbData: any, newData: any): boolean {
    if (!dbData || !newData) {
      return false;
    }

    // id와 timestamp를 제외한 복사본 생성
    const cleanDbData = this.removeVolatileFields(dbData);
    const cleanNewData = this.removeVolatileFields(newData);

    // 깊은 비교 수행
    return this.deepEqual(cleanDbData, cleanNewData);
  }

  // 가변 필드 제거 (id, timestamp)
  private removeVolatileFields(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const cleaned = { ...data };
    delete cleaned.id;
    delete cleaned.timestamp;
    
    return cleaned;
  }

  // 깊은 객체 비교 함수
  private deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
      return true;
    }

    if (obj1 == null || obj2 == null) {
      return obj1 === obj2;
    }

    if (typeof obj1 !== typeof obj2) {
      return false;
    }

    if (typeof obj1 !== 'object') {
      return obj1 === obj2;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false;
      }

      if (!this.deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }

  /**
   * 테스트용 수동 스케줄 실행 함수
   */
  async runScheduleManually(): Promise<void> {
    console.log('수동 스케줄 실행 시작');
    await this.runScheduleWithLogging('manual-schedule-task');
  }

  /**
   * TaskLog 관련 조회 함수들
   */
  async getTaskLogs(page: number = 1, limit: number = 20, date?: string) {
    const queryBuilder = this.taskLogRepository.createQueryBuilder('taskLog');
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      queryBuilder.where('taskLog.createdAt >= :startDate AND taskLog.createdAt < :endDate', {
        startDate,
        endDate,
      });
    }
    
    queryBuilder
      .orderBy('taskLog.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    
    const [logs, total] = await queryBuilder.getManyAndCount();
    
    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTaskLogStats(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // 기간 내 전체 통계
    const stats = await this.taskLogRepository
      .createQueryBuilder('taskLog')
      .select([
        'COUNT(*) as totalRuns',
        'COUNT(CASE WHEN status = :success THEN 1 END) as successfulRuns',
        'COUNT(CASE WHEN status = :failed THEN 1 END) as failedRuns',
        'AVG(duration) as averageRunTime',
      ])
      .where('taskLog.createdAt >= :startDate AND taskLog.createdAt <= :endDate', {
        startDate,
        endDate,
      })
      .setParameters({ success: TaskStatus.SUCCESS, failed: TaskStatus.FAILED })
      .getRawOne();

    // 일별 통계
    const dailyStats = await this.taskLogRepository
      .createQueryBuilder('taskLog')
      .select([
        'DATE(taskLog.createdAt) as date',
        'COUNT(*) as totalRuns',
        'COUNT(CASE WHEN status = :success THEN 1 END) as successfulRuns',
        'COUNT(CASE WHEN status = :failed THEN 1 END) as failedRuns',
        'AVG(duration) as averageRunTime',
      ])
      .where('taskLog.createdAt >= :startDate AND taskLog.createdAt <= :endDate', {
        startDate,
        endDate,
      })
      .setParameters({ success: TaskStatus.SUCCESS, failed: TaskStatus.FAILED })
      .groupBy('DATE(taskLog.createdAt)')
      .orderBy('date', 'DESC')
      .getRawMany();

    return {
      period: { startDate, endDate },
      totalRuns: parseInt(stats.totalRuns) || 0,
      successfulRuns: parseInt(stats.successfulRuns) || 0,
      failedRuns: parseInt(stats.failedRuns) || 0,
      averageRunTime: Math.round(parseFloat(stats.averageRunTime)) || 0,
      dailyStats: dailyStats.map(stat => ({
        date: stat.date,
        totalRuns: parseInt(stat.totalRuns),
        successfulRuns: parseInt(stat.successfulRuns),
        failedRuns: parseInt(stat.failedRuns),
        averageRunTime: Math.round(parseFloat(stat.averageRunTime)) || 0,
      })),
    };
  }

  // crawlResult 저장 메서드
  async saveCrawlResult(scheduleId: number, crawlResult: any): Promise<ScheduleModel> {
    const schedule = await this.scheduleRepository.findOne({ where: { id: scheduleId } });
    
    if (!schedule) {
      throw new BadRequestException('스케줄을 찾을 수 없습니다.');
    }

    schedule.crawlResult = crawlResult;
    const savedSchedule = await this.scheduleRepository.save(schedule);

    // 스케줄 등록 완료 이메일 발송
    try {
      const scheduleData = {
        address: schedule.address,
        addressPin: schedule.addressPin,
        ownerName: schedule.ownerName,
      };

      await this.emailService.sendScheduleRegistrationEmail(
        schedule.email,
        scheduleData,
        crawlResult
      );

      console.log(`✅ 스케줄 등록 완료 이메일 발송 성공: ${schedule.email}`);
    } catch (error) {
      console.error(`❌ 스케줄 등록 완료 이메일 발송 실패: ${schedule.email}`, error);
      // 이메일 발송 실패해도 스케줄 저장은 유지
    }

    return savedSchedule;
  }
}