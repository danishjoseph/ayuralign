import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HealthData } from './entities/health-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HealthData])],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
