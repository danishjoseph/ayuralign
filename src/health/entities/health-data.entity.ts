import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('health_data')
export class HealthData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  IR: number;

  @Column('float')
  HeartRate: number;

  @Column('float')
  SpO2: number;

  @Column('float')
  TempC: number;

  @Column('float')
  TempF: number;

  @Column('float')
  GSR: number;

  @Column('float')
  LSM_AccX: number;

  @Column('float')
  LSM_AccY: number;

  @Column('float')
  LSM_AccZ: number;

  @Column({ length: 50 })
  HR_Status: string;

  @Column({ length: 50 })
  SpO2_Status: string;

  @Column({ length: 50 })
  Temp_Status: string;

  @Column({ length: 50 })
  Stress_Level: string;

  @Column({ length: 50 })
  Movement_Status: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
