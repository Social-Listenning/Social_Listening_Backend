import { Injectable } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { CreateWorkflowVariableDTO } from '../dtos/workflow.dto';

@Injectable()
export class WorkflowVariableService {
  constructor(private readonly prismaService: PrismaService) {}

  async saveWorkflowVariable(workflowVar: CreateWorkflowVariableDTO) {
    try {
      let newWorkflowVar = null;

      if (!workflowVar.id) {
        newWorkflowVar = await this.prismaService.workflowVariable.create({
          data: workflowVar,
        });
      } else {
        newWorkflowVar = await this.prismaService.workflowVariable.update({
          where: { id: workflowVar.id },
          data: workflowVar,
        });
      }

      return newWorkflowVar;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async removeAllVariable(workflowId: string) {
    try {
      await this.prismaService.workflowVariable.deleteMany({
        where: { flowId: workflowId },
      });
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async findVariable(workflowId: string, variableName: string) {
    try {
      return await this.prismaService.workflowVariable.findFirst({
        where: {
          flowId: workflowId,
          variableName: variableName,
        },
      });
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
