import { ApiProperty } from '@nestjs/swagger';

export class HealthDataDto {
  @ApiProperty({ example: 0.5, description: 'Infrared value' })
  IR: number;

  @ApiProperty({ example: 72, description: 'Heart rate in BPM' })
  HeartRate: number;

  @ApiProperty({
    example: 98,
    description: 'Blood oxygen saturation percentage',
  })
  SpO2: number;

  @ApiProperty({ example: 36.5, description: 'Temperature in Celsius' })
  TempC: number;

  @ApiProperty({ example: 97.7, description: 'Temperature in Fahrenheit' })
  TempF: number;

  @ApiProperty({ example: 0.5, description: 'Galvanic skin response' })
  GSR: number;

  @ApiProperty({ example: 0.1, description: 'Accelerometer X-axis' })
  LSM_AccX: number;

  @ApiProperty({ example: 0.2, description: 'Accelerometer Y-axis' })
  LSM_AccY: number;

  @ApiProperty({ example: 9.8, description: 'Accelerometer Z-axis' })
  LSM_AccZ: number;
}

export class HealthDataResponseDto {
  @ApiProperty({ example: 'Normal' })
  HR_Status: string;

  @ApiProperty({ example: 'Normal' })
  SpO2_Status: string;

  @ApiProperty({ example: 'Normal' })
  Temp_Status: string;

  @ApiProperty({ example: 'Relaxed' })
  Stress_Level: string;

  @ApiProperty({ example: 'Normal' })
  Movement_Status: string;
}
