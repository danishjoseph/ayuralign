import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  name: string;

  @ApiProperty({ example: '1234567890', description: 'Phone number' })
  phone: string;

  @ApiProperty({ example: '1995-06-15', description: 'Date of birth' })
  dob: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address (used as username)',
  })
  email: string;

  @ApiProperty({ example: 'securepass123', description: 'Account password' })
  password: string;
}

export class RegisterResponseDto {
  @ApiProperty({ example: 'User registered successfully' })
  message: string;

  @ApiProperty({ example: 1 })
  loginid: number;
}
