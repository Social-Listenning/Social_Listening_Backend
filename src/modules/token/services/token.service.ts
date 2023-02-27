import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';

@Injectable()
export class TokenService {
  constructor(private readonly prismaService: PrismaService) {}

  async createToken(token: string) {
    const dataCreate = { token: token };
    return this.prismaService.token.create({ data: dataCreate });
  }

  async getToken(tokenId: string) {
    const token = await this.prismaService.token.findFirst({
      where: { id: tokenId },
    });
    return token?.token;
  }
}
