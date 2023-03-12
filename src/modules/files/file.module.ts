import { PrismaModule } from 'src/config/database/database.config.module';
import { Module } from '@nestjs/common';
import { SettingModule } from '../setting/setting.module';
import { FileService } from './services/file.service';
import { FileController } from './controllers/file.controller';

@Module({
  controllers: [FileController],
  imports: [PrismaModule, SettingModule],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
