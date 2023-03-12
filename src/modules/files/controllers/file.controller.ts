import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { PagedData } from 'src/common/models/paging/pagedData.dto';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { FilePage } from '../dtos/filePage.dto';
import { AdvancedFilteringService } from 'src/config/database/advancedFiltering.service';
import { FileService } from '../services/file.service';
import { JWTAuthGuard } from 'src/modules/auth/guards/jwtAuth.guard';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly advancedFilteringService: AdvancedFilteringService,
  ) {}

  @Post()
  @UseGuards(JWTAuthGuard)
  async getFileWithGroup(
    @Req() request: RequestWithUser,
    @Body() page: FilePage,
  ) {
    const user = request.user;
    const result = new PagedData<object>(page);

    try {
      if (user.role !== 'OWNER')
        throw new Error(`You are not allowed to access this page`);

      const group = user.id;

      const data = this.advancedFilteringService.createFilter(page);
      data.filter.AND.push({ ownerId: group });

      const listResult = await this.fileService.findFileWithGroup(data);

      result.Data = listResult;
      result.Page.totalElement = await this.fileService.countFileWithGroup(
        group,
      );
    } catch (error) {}
    return result;
  }

  @Get(':id')
  @UseGuards(JWTAuthGuard)
  async getFileById(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = request.user;
    const file = await this.fileService.getFileById(id);

    if (!file) throw new NotFoundException(`File not found`);
    if (user.id !== file.ownerId)
      throw new BadRequestException(`This is not your file`);

    const stream = createReadStream(join(process.cwd(), file.path));
    response.set({
      'Content-Disposition': `inline; filename="${file.fileName}"`,
      'Content-Type': file.minetype,
    });
    return new StreamableFile(stream);
  }
}
