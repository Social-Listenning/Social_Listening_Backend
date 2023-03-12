import { PrismaModule } from 'src/config/database/database.config.module';
import { Module } from '@nestjs/common';
import { SettingModule } from '../setting/setting.module';
import { FileService } from './services/file.service';

@Module({
  imports: [PrismaModule, SettingModule],
  providers: [FileService],
  exports: [FileService],
})
export class FileModule {}
