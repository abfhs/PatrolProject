import { Column, Entity, Index } from 'typeorm';
import { BaseModel } from 'src/common/entities/base.entity';

@Entity()
@Index(['addressPin', 'email'], { unique: true }) // 같은 주소핀과 이메일 조합은 중복 방지
export class ScheduleModel extends BaseModel {
  
  @Column()
  addressPin: string;

  @Column()
  ownerName: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column({
    type: 'json',
    nullable: true,
    default: null,
  })
  crawlResult: any;
}