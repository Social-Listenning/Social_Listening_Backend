import { Injectable } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { excludeData } from 'src/utils/excludeData';
import { WorkflowActivationDTO } from '../dtos/workflowActivation.dto';
import {
  CreateWorkflowDTO,
  CreateWorkflowEdgeDTO,
  CreateWorkflowNodeDTO,
  CreateWorkflowVariableDTO,
  WorkflowDTO,
} from '../dtos/workflow.dto';
import { WorkflowNodeService } from './workflowNode.service';
import { WorkflowEdgeService } from './workflowEdge.service';
import { WorkflowVariableService } from './workflowVariable.service';

@Injectable()
export class WorkflowService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly workflowNodeService: WorkflowNodeService,
    private readonly workflowEdgeService: WorkflowEdgeService,
    private readonly workflowVariableService: WorkflowVariableService,
  ) {}

  async getAllWorkflow(page) {
    try {
      const listWorkflow = await this.prismaService.workflow.findMany({
        where: page.filter,
        orderBy: page.orders,
        include: {
          socialTab: true,
        },
        skip: (page.pageNumber - 1) * page.size,
        take: page.size,
      });

      return listWorkflow.map((workflow) => {
        excludeData(workflow.socialTab, ['delete']);
        return excludeData(workflow, ['delete']);
      });
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async countWorkflow(page) {
    try {
      const countWorkflow = await this.prismaService.workflow.count({
        where: page.filter,
      });
      return countWorkflow;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async getWorkflowById(workflowId: string) {
    try {
      const workflow = await this.prismaService.workflow.findFirst({
        where: {
          id: workflowId,
          delete: false,
        },
      });
      return workflow;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async deactivateAllWorkflow() {
    try {
      await this.prismaService.workflow.updateMany({
        data: { isActive: false },
      });
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async updateActivation(workflowId: string, data: WorkflowActivationDTO) {
    try {
      const workflow = await this.prismaService.workflow.update({
        where: { id: workflowId },
        data: { isActive: data.activate },
      });
      return excludeData(workflow, ['delete']);
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async deleteWorkflow(workflowId: string) {
    try {
      const workflow = await this.prismaService.workflow.update({
        where: { id: workflowId },
        data: { delete: true },
      });
      return excludeData(workflow, ['delete']);
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async createWorkflow(workflow: WorkflowDTO) {
    try {
      const listNode = workflow.data.nodes;
      const listEdge = workflow.data.edges;
      const listVariable = workflow.data.variables;
      const createWorkflowData: CreateWorkflowDTO = {
        name: workflow.name,
        tabId: workflow.tabId,
        extendData: JSON.stringify(workflow.data),
      };

      const workflowData = await this.saveWorkflowData(createWorkflowData);
      Promise.all([
        listNode.map(async (node) => {
          const workflowNodeData: CreateWorkflowNodeDTO = {
            id: node.id,
            flowId: workflowData.id,
            type: node.type,
            position_X: node.position.x,
            position_Y: node.position.y,
            data: JSON.stringify(node.data),
          };

          await this.workflowNodeService.saveWorkflowNode(workflowNodeData);
        }),
        listEdge.map(async (edge) => {
          const workflowEdgeData: CreateWorkflowEdgeDTO = {
            id: edge.id,
            flowId: workflowData.id,
            sourceId: edge.source,
            sourceName: edge.sourceHandle,
            targetId: edge.target,
            targetName: edge.targetHandle,
          };

          await this.workflowEdgeService.saveWorkflowEdge(workflowEdgeData);
        }),
        listVariable.map(async (variable) => {
          const workflowVariableData: CreateWorkflowVariableDTO = {
            flowId: workflowData.id,
            variableName: variable.label,
          };
          await this.workflowVariableService.saveWorkflowVariable(
            workflowVariableData,
          );
        }),
      ]);

      excludeData(workflowData, ['delete']);
      return workflowData;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async updateWorkflow(workflowId: string, workflow: WorkflowDTO) {
    try {
      const listNode = workflow.data.nodes;
      const listEdge = workflow.data.edges;
      const listVariable = workflow.data.variables;
      const createWorkflowData: CreateWorkflowDTO = {
        id: workflowId,
        name: workflow.name,
        tabId: workflow.tabId,
        extendData: JSON.stringify(workflow.data),
      };

      const workflowData = await this.saveWorkflowData(createWorkflowData);

      await this.workflowNodeService.removeAllNode(workflowId);
      await this.workflowEdgeService.removeAllEdge(workflowId);
      await this.workflowVariableService.removeAllVariable(workflowId);

      Promise.all([
        listNode.map(async (node) => {
          const workflowNodeData: CreateWorkflowNodeDTO = {
            id: node.id,
            flowId: workflowData.id,
            type: node.type,
            position_X: node.position.x,
            position_Y: node.position.y,
            data: JSON.stringify(node.data),
          };

          await this.workflowNodeService.saveWorkflowNode(workflowNodeData);
        }),
        listEdge.map(async (edge) => {
          const workflowEdgeData: CreateWorkflowEdgeDTO = {
            id: edge.id,
            flowId: workflowData.id,
            sourceId: edge.source,
            sourceName: edge.sourceHandle,
            targetId: edge.target,
            targetName: edge.targetHandle,
          };

          await this.workflowEdgeService.saveWorkflowEdge(workflowEdgeData);
        }),
        listVariable.map(async (variable) => {
          const existedVariable =
            await this.workflowVariableService.findVariable(
              workflowData.id,
              variable.label,
            );
          const workflowVariableData: CreateWorkflowVariableDTO = {
            id: existedVariable ? existedVariable.id : '',
            flowId: workflowData.id,
            variableName: variable.label,
          };

          await this.workflowVariableService.saveWorkflowVariable(
            workflowVariableData,
          );
        }),
      ]);

      excludeData(workflowData, ['delete']);
      return workflowData;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async haveReceiveMessageNode(tabId: string) {
    try {
      const workflowActive = await this.prismaService.workflow.findFirst({
        where: { tabId: tabId, isActive: true },
      });
      if (!workflowActive) return false;

      const receiveNode = await this.workflowNodeService.findReceiveNode(
        workflowActive.id,
      );

      return receiveNode ? true : false;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  private async saveWorkflowData(workflow: CreateWorkflowDTO) {
    try {
      let newWorkflow = null;
      if (!workflow.id) {
        newWorkflow = await this.prismaService.workflow.create({
          data: workflow,
        });
      } else {
        newWorkflow = await this.prismaService.workflow.update({
          where: { id: workflow.id },
          data: workflow,
        });
      }

      return newWorkflow;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
