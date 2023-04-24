import { PrismaModule } from 'src/config/database/database.config.module';
import { WorkflowController } from './controllers/workflow.controller';
import { WorkflowService } from './services/workflow.service';
import { Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
