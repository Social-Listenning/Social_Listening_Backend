import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialMessageDTO } from '../dtos/socialMessage.dto';

@Injectable()
export class SocialMessageService {
  constructor(private prismaService: PrismaService) {}

  async saveMessage(message: SocialMessageDTO) {
    const savedMessage = await this.prismaService.socialMessage.create({
      data: message,
    });
    return savedMessage;
  }
}
