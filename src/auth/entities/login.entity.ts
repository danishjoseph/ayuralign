import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('login')
export class Login {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 50 })
  usertype: string;

  @OneToOne(() => Patient, (patient) => patient.login)
  patient: Patient;
}
