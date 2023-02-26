import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateAccountDTO {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  userName: string;

  @IsString()
  fullName: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber: string;
}
