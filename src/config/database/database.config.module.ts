import { Module } from '@nestjs/common';
import { PrismaService } from './database.config.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
