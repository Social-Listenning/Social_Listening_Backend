import { PrismaModule } from 'src/config/database/database.config.module';
import { SocialPostController } from './controllers/socialPost.controller';
import { SocialPostService } from './services/socialPost.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [SocialPostController],
  providers: [SocialPostService],
  exports: [SocialPostService],
})
export class SocialPostModule {}
