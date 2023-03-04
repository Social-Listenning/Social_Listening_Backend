import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateSocialGroupDTO } from '../dtos/socialGroup.dto';

@Injectable()
export class SocialGroupService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSocailGroup(data: CreateSocialGroupDTO) {
    const newSocialGroup = await this.prismaService.socialGroup.create({
      data: data,
    });
    return newSocialGroup;
  }
}
