import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthDataDto, HealthDataResponseDto } from './dto/health-data.dto';
import { HealthData } from './entities/health-data.entity';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post('send')
  @ApiOperation({ summary: 'Submit health vitals and get status assessment' })
  @ApiBody({ type: HealthDataDto })
  @ApiResponse({
    status: 201,
    description: 'Health status assessment',
    type: HealthDataResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async sendData(@Body() dto: HealthDataDto) {
    return this.healthService.sendData(dto);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get the 20 most recent health data records' })
  @ApiResponse({
    status: 200,
    description: 'List of recent health records',
    type: [HealthData],
  })
  async getRecent() {
    return this.healthService.getRecent();
  }

  @Get('latest')
  @ApiOperation({ summary: 'Get the single most recent health data record' })
  @ApiResponse({
    status: 200,
    description: 'Latest health record',
    type: [HealthData],
  })
  async getLatest() {
    return this.healthService.getLatest();
  }
}
