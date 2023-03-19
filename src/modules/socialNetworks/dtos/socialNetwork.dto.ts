import { IsOptional, IsString } from 'class-validator';

export class ConnectSocialNetworkDTO {
  @IsString()
  socialType: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  extendData: string;
}
