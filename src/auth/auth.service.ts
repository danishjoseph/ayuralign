import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Login } from './entities/login.entity';
import { Patient } from './entities/patient.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Login)
    private readonly loginRepo: Repository<Login>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.loginRepo.findOne({
      where: { username: dto.email },
    });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashed = await bcrypt.hash(dto.password, 10);

    const login = this.loginRepo.create({
      username: dto.email,
      password: hashed,
      usertype: 'user',
    });
    const savedLogin = await this.loginRepo.save(login);

    const patient = this.patientRepo.create({
      name: dto.name,
      phone: dto.phone,
      dob: dto.dob,
      email: dto.email,
      loginid: savedLogin.id,
    });
    await this.patientRepo.save(patient);

    return { message: 'User registered successfully', loginid: savedLogin.id };
  }

  async login(dto: LoginDto) {
    const user = await this.loginRepo.findOne({
      where: { username: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('invalid');
    }

    return {
      loginid: user.id,
      username: user.username,
      type: user.usertype,
      task: 'success',
    };
  }
}
