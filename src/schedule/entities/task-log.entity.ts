import { Column, Entity, Index } from 'typeorm';
import { BaseModel } from 'src/common/entities/base.entity';

export enum TaskStatus {
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity()
@Index(['taskName', 'createdAt']) // 작업명과 실행일시로 인덱스
@Index(['status', 'createdAt']) // 상태와 실행일시로 인덱스
export class TaskLog extends BaseModel {
  
  @Column()
  taskName: string; // 작업 이름 (예: 'daily-schedule-task')

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.RUNNING,
  })
  status: TaskStatus;

  @Column({ type: 'text', nullable: true })
  result: string; // 성공 시 결과 데이터 (JSON 문자열)

  @Column({ type: 'text', nullable: true })
  error: string; // 실패 시 에러 메시지

  @Column()
  startTime: Date; // 시작 시간

  @Column({ nullable: true })
  endTime: Date; // 종료 시간

  @Column({ nullable: true })
  duration: number; // 실행 시간 (밀리초)

  @Column({ nullable: true })
  scheduleId: number; // 관련된 스케줄 ID (개별 스케줄 실행 시)

  @Column({ type: 'json', nullable: true })
  inputData: any; // 입력 데이터 (스케줄 정보)

  @Column({ default: 0 })
  processedCount: number; // 처리된 항목 수

  @Column({ default: 0 })
  successCount: number; // 성공한 항목 수

  @Column({ default: 0 })
  failureCount: number; // 실패한 항목 수
}