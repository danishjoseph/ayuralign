import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Login } from './login.entity';

@Entity('patient_table')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 20 })
  dob: string;

  @Column({ length: 255 })
  email: string;

  @Column()
  loginid: number;

  @OneToOne(() => Login, (login) => login.patient)
  @JoinColumn({ name: 'loginid' })
  login: Login;
}
