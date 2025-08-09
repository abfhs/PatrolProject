import { BaseModel } from 'src/common/entities/base.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UsersModel } from 'src/users/entities/users.entitys';

@Entity('password_reset_tokens')
export class PasswordResetToken extends BaseModel {
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  token: string;

  @Column({
    name: 'user_id',
  })
  userId: number;

  @ManyToOne(() => UsersModel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UsersModel;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
  })
  expiresAt: Date;

  @Column({
    name: 'used_at',
    type: 'timestamp',
    nullable: true,
  })
  usedAt?: Date;

  @Column({
    name: 'is_used',
    type: 'boolean',
    default: false,
  })
  isUsed: boolean;
}