import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpDTO {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
  password: string;
}