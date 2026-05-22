import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthData } from './entities/health-data.entity';
import { HealthDataDto } from './dto/health-data.dto';
import { detectStatus } from '../common/status-detector';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(HealthData)
    private readonly healthRepo: Repository<HealthData>,
  ) {}

  async sendData(dto: HealthDataDto) {
    if (!dto) {
      throw new BadRequestException('fail');
    }

    const status = detectStatus(dto);

    const record = this.healthRepo.create({
      IR: dto.IR,
      HeartRate: dto.HeartRate,
      SpO2: dto.SpO2,
      TempC: dto.TempC,
      TempF: dto.TempF,
      GSR: dto.GSR,
      LSM_AccX: dto.LSM_AccX,
      LSM_AccY: dto.LSM_AccY,
      LSM_AccZ: dto.LSM_AccZ,
      ...status,
    });

    await this.healthRepo.save(record);

    return status;
  }

  async getRecent() {
    return this.healthRepo.find({
      order: { id: 'DESC' },
      take: 20,
    });
  }

  async getLatest() {
    return this.healthRepo.find({
      order: { timestamp: 'DESC' },
      take: 1,
    });
  }
}
