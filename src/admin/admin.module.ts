import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModel } from '../users/entities/users.entitys';
import { ScheduleModel } from '../schedule/entities/schedule.entity';
import { TaskLog } from '../schedule/entities/task-log.entity';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ScheduleModule } from '../schedule/schedule.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersModel, ScheduleModel, TaskLog]),
    AuthModule, // AdminGuard 사용을 위해
    UsersModule, // AdminGuard가 UsersService에 의존
    ScheduleModule, // ScheduleService 사용을 위해
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}