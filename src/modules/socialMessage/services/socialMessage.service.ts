import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { SocialMessageDTO } from '../dtos/socialMessage.dto';
import { excludeSocialMessage } from '../model/exclude.model';
import { excludeData } from 'src/utils/excludeData';

@Injectable()
export class SocialMessageService {
  constructor(private prismaService: PrismaService) {}

  async saveMessage(message: SocialMessageDTO) {
    const savedMessage = await this.prismaService.socialMessage.create({
      data: message,
    });
    return savedMessage;
  }

  async findComment(page) {
    const listComments = await this.prismaService.socialMessage.findMany({
      where: page.filter,
      orderBy: page.orders,
      skip: (page.pageNumber - 1) * page.size,
      take: page.size,
    });
    return listComments.map((data) => excludeData(data, excludeSocialMessage));
  }

  async countComment(page) {
    const countComments = await this.prismaService.socialMessage.count({
      where: page.filter,
    });
    return countComments;
  }
}
