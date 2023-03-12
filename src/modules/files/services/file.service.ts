import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateFileDTO } from '../dtos/createFile.dto';

@Injectable()
export class FileService {
  constructor(private readonly prismaService: PrismaService) {}

  async saveFile(data: CreateFileDTO) {
    const file = await this.prismaService.file.create({
      data: data,
    });
    return file;
  }
}
