import { Injectable } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateWorkflowNodeDTO } from '../dtos/workflow.dto';

@Injectable()
export class WorkflowNodeService {
  constructor(private readonly prismaService: PrismaService) {}

  async saveWorkflowNode(workflowNode: CreateWorkflowNodeDTO) {
    try {
      const newWorkflowNode = await this.prismaService.workflowNode.upsert({
        where: { id: workflowNode.id },
        create: workflowNode,
        update: workflowNode,
      });

      return newWorkflowNode;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
