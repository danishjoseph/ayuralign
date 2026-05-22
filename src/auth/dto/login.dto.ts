import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Registered email address',
  })
  email: string;

  @ApiProperty({ example: 'securepass123', description: 'Account password' })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 1 })
  loginid: number;

  @ApiProperty({ example: 'john@example.com' })
  username: string;

  @ApiProperty({ example: 'user' })
  type: string;

  @ApiProperty({ example: 'success' })
  task: string;
}
