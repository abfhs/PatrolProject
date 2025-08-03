import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduleModel } from './entities/schedule.entity';

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
    console.log('=== 매일 오전 11시 스케줄 작업 시작 ===');
    
    try {
      // 모든 스케줄 데이터 조회
      const schedules = await this.findAllSchedules();
      
      if (schedules.length === 0) {
        console.log('처리할 스케줄 데이터가 없습니다.');
        return;
      }

      console.log(`총 ${schedules.length}개의 스케줄 데이터를 처리합니다.`);

      // 각 스케줄 데이터에 대해 작업 실행
      for (const schedule of schedules) {
        await this.processScheduleItem(schedule);
      }

      console.log('=== 스케줄 작업 완료 ===');
    } catch (error) {
      console.error('스케줄 작업 중 오류 발생:', error);
    }
  }

  // 개별 스케줄 아이템 처리
  private async processScheduleItem(schedule: ScheduleModel): Promise<void> {
    try {
      console.log(`처리 중: ${schedule.email} - ${schedule.address}`);
      
      // 여기서 실제 작업 함수 호출
      await this.executeCustomTask(schedule);
      
      console.log(`처리 완료: ${schedule.email}`);
    } catch (error) {
      console.error(`처리 실패: ${schedule.email}`, error);
    }
  }

  /**
   * 사용자가 정의할 실제 작업 함수
   * 현재는 빈 함수로 준비되어 있으며, 사용자가 나중에 구현할 예정
   */
  private async executeCustomTask(schedule: ScheduleModel): Promise<void> {
    // TODO: 여기에 실제 작업 로직을 구현하세요
    // 예시: 
    // - 등기정보 조회
    // - 변경사항 확인
    // - 이메일 알림 발송
    // - 외부 API 호출 등
    
    console.log('작업 실행:', {
      addressPin: schedule.addressPin,
      ownerName: schedule.ownerName,
      email: schedule.email,
      address: schedule.address,
    });

    // 임시로 1초 대기 (실제 작업 시뮬레이션)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('작업 완료 (임시)');
  }

  /**
   * 테스트용 수동 스케줄 실행 함수
   */
  async runScheduleManually(): Promise<void> {
    console.log('수동 스케줄 실행 시작');
    await this.handleScheduledTask();
  }
}