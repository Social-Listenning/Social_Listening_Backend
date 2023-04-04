import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialPostDTO } from '../dtos/socialMessage.dto';

@Injectable()
export class SocialPostService {
  constructor(private prismaService: PrismaService) {}

  async savePost(message: SocialPostDTO) {
    const savedMessage = await this.prismaService.socialPost.create({
      data: message,
    });
    return savedMessage;
  }

  async findPost(socialPostId: string) {
    const savedMessage = await this.prismaService.socialPost.findFirst({
      where: { postId: socialPostId },
    });
    return savedMessage;
  }
}
