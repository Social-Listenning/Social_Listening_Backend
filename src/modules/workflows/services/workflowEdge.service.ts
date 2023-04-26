import { Injectable } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateWorkflowEdgeDTO } from '../dtos/workflow.dto';

@Injectable()
export class WorkflowEdgeService {
  constructor(private readonly prismaService: PrismaService) {}

  async saveWorkflowEdge(workflowEdge: CreateWorkflowEdgeDTO) {
    try {
      const newWorkflowEdge = await this.prismaService.workflowEdge.upsert({
        where: { id: workflowEdge.id },
        create: workflowEdge,
        update: workflowEdge,
      });

      return newWorkflowEdge;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async removeAllEdge(workflowId: string) {
    try {
      await this.prismaService.workflowEdge.deleteMany({
        where: { flowId: workflowId },
      });
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
