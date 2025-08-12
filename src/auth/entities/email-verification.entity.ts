import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseModel } from 'src/common/entities/base.entity';
import { UsersModel } from 'src/users/entities/users.entitys';

@Entity()
export class EmailVerification extends BaseModel {
  @Column()
  userId: number;

  @ManyToOne(() => UsersModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersModel;

  @Column()
  email: string;

  @Column({ unique: true })
  verificationToken: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isVerified: boolean;
}