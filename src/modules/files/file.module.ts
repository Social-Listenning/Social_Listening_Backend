import { PrismaModule } from 'src/config/database/database.config.module';
import { Module } from '@nestjs/common';
import { SettingModule } from '../setting/setting.module';

@Module({
  imports: [PrismaModule, SettingModule],
  providers: [],
  exports: [],
})
export class FileModule {}
