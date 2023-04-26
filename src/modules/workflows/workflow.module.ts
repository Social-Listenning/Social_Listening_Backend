import { PrismaModule } from 'src/config/database/database.config.module';
import { WorkflowController } from './controllers/workflow.controller';
import { WorkflowService } from './services/workflow.service';
import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { WorkflowNodeService } from './services/workflowNode.service';
import { WorkflowEdgeService } from './services/workflowEdge.service';
import { WorkflowVariableService } from './services/workflowVariable.service';

@Module({
  imports: [PrismaModule, forwardRef(() => UserModule)],
  controllers: [WorkflowController],
  providers: [
    WorkflowService,
    WorkflowNodeService,
    WorkflowEdgeService,
    WorkflowVariableService,
  ],
  exports: [WorkflowService],
})
export class WorkflowModule {}
