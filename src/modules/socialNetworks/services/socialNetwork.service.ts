import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { ConnectSocialNetworkDTO } from '../dtos/socialNetwork.dto';

@Injectable()
export class SocialNetworkService {
  constructor(private readonly prismaService: PrismaService) {}

  async connectSocialNetwork(data: ConnectSocialNetworkDTO) {
    const socialNetwork = await this.prismaService.socialNetwork.create({
      data: data,
    });
    return socialNetwork;
  }
}
