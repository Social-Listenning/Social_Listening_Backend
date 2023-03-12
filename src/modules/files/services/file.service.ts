import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateFileDTO } from '../dtos/createFile.dto';
import { excludeData } from 'src/utils/excludeData';
import { excludeFile } from '../models/exclude.model';

@Injectable()
export class FileService {
  constructor(private readonly prismaService: PrismaService) {}

  async saveFile(data: CreateFileDTO) {
    const file = await this.prismaService.file.create({
      data: data,
    });
    return file;
  }

  async getFileById(fileId: string) {
    return await this.prismaService.file.findFirst({ where: { id: fileId } });
  }

  async findFileWithGroup(page) {
    const listFile = await this.prismaService.file.findMany({
      where: page.filter,
      orderBy: page.orders,
      skip: (page.pageNumber - 1) * page.size,
      take: page.size,
    });

    return listFile.map((file) => excludeData(file, excludeFile));
  }

  async countFileWithGroup(ownerId: string) {
    return await this.prismaService.file.count({ where: { ownerId: ownerId } });
  }

  private getMimetype(file) {
    const fileName = file.path.split(`\\`).pop();
    const mimetype = fileName.split('.')[1];

    return mimetype;
  }

  private removeMimetype(file) {
    const fileName = file.fileName.split('.');
    fileName.pop();

    return fileName.join('.');
  }
}
