import { PrismaModule } from 'src/config/database/database.config.module';
import { WorkflowController } from './controllers/workflow.controller';
import { WorkflowService } from './services/workflow.service';
import { Module, forwardRef } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { WorkflowNodeService } from './services/workflowNode.service';
import { WorkflowEdgeService } from './services/workflowEdge.service';
import { WorkflowVariableService } from './services/workflowVariable.service';
import { HttpModule } from '@nestjs/axios';
import { WorkflowDataService } from './services/workflowData.service';
import { SocialGroupModule } from '../socialGroups/socialGroup.module';
import { SocialMessageModule } from '../socialMessage/socialMessage.module';
import { MessageModule } from '../message/message.module';
import { SocialSenderModule } from '../socialSender/socialSender.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UserModule),
    forwardRef(() => SocialGroupModule),
    forwardRef(() => SocialMessageModule),
    forwardRef(() => MessageModule),
    SocialSenderModule,
    MessageModule,
    HttpModule,
  ],
  controllers: [WorkflowController],
  providers: [
    WorkflowService,
    WorkflowNodeService,
    WorkflowEdgeService,
    WorkflowDataService,
    WorkflowVariableService,
  ],
  exports: [WorkflowService],
})
export class WorkflowModule {}
