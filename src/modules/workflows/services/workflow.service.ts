import { HttpService } from '@nestjs/axios';
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
import { WorkflowNodeType } from 'src/common/enum/workflowNode.enum';
import { Helper } from 'src/utils/hepler';
import { WorkflowDataService } from './workflowData.service';

@Injectable()
export class WorkflowService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
    private readonly nodeService: WorkflowNodeService,
    private readonly edgeService: WorkflowEdgeService,
    private readonly dataService: WorkflowDataService,
    private readonly variableService: WorkflowVariableService,
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

          await this.nodeService.saveWorkflowNode(workflowNodeData);
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

          await this.edgeService.saveWorkflowEdge(workflowEdgeData);
        }),
        listVariable.map(async (variable) => {
          const workflowVariableData: CreateWorkflowVariableDTO = {
            id: variable,
            flowId: workflowData.id,
            variableName: variable,
          };
          await this.variableService.saveWorkflowVariable(workflowVariableData);
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

      await this.nodeService.removeAllNode(workflowId);
      await this.edgeService.removeAllEdge(workflowId);
      await this.variableService.removeAllVariable(workflowId);

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

          await this.nodeService.saveWorkflowNode(workflowNodeData);
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

          await this.edgeService.saveWorkflowEdge(workflowEdgeData);
        }),
        listVariable.map(async (variable) => {
          const existedVariable = await this.variableService.findVariable(
            workflowData.id,
            variable,
          );
          const workflowVariableData: CreateWorkflowVariableDTO = {
            id: existedVariable ? existedVariable.id : variable,
            flowId: workflowData.id,
            variableName: variable,
          };

          await this.variableService.saveWorkflowVariable(workflowVariableData);
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

      const receiveNode = await this.nodeService.findReceiveNode(
        workflowActive.id,
      );

      return receiveNode ? true : false;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async tryCallHook(tabId: string, currentNodeType: string, data) {
    try {
      const workflow = await this.findWorkflowByTabId(tabId);
      await this.dataService.updateData(workflow.id, data['messageId'], data);
      const currentNode = await this.nodeService.findNodeByFlowId(
        workflow.id,
        currentNodeType,
      );

      switch (currentNodeType) {
        case WorkflowNodeType.ReceiveMessage:
          const nextNode = await this.edgeService.findNextWorkflowNode(
            workflow.id,
            currentNode.id,
          );

          if (nextNode) {
            if (nextNode.type === WorkflowNodeType.SentimentAnalysis)
              await this.callService(
                workflow.id,
                data['messageId'],
                nextNode.type,
              );
            else if (nextNode.type === WorkflowNodeType.ResponseMessage)
              await this.callService(
                workflow.id,
                data['messageId'],
                nextNode.type,
                {
                  messageReply: JSON.parse(nextNode.data)['respond'],
                },
              );
          }
          break;
        case WorkflowNodeType.SentimentAnalysis:
          let canStopFlow = false;
          const nodeData = JSON.parse(currentNode.data);
          const range = Helper.getSentimentRange(nodeData.sentiment);
          const maxSentimentAlert = nodeData['conditionNotifyAgent'];

          if (maxSentimentAlert > 0) {
            const numberSentiment = data['sentiment'];
            if (numberSentiment >= maxSentimentAlert) {
              canStopFlow = true;
              await this.callService(
                workflow.id,
                data['messageId'],
                WorkflowNodeType.NotifyAgent,
              );
            }
          }

          if (!canStopFlow) {
            const sentimentType = this.getSentimentType(
              range,
              data['exactSentiment'],
            );
            const nodeName = nodeData.handle[sentimentType];

            const nextNode = await this.edgeService.findNextWorkflowNode(
              workflow.id,
              currentNode.id,
              nodeName,
            );

            if (nextNode) {
              await this.callService(
                workflow.id,
                data['messageId'],
                nextNode.type,
                {
                  messageReply: JSON.parse(nextNode.data)['respond'],
                },
              );
            }
          }

          break;
        case WorkflowNodeType.ResponseMessage:
          break;
        case WorkflowNodeType.NotifyAgent:
          break;
      }
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  private async findWorkflowByTabId(tabId: string) {
    try {
      const workflowActive = await this.prismaService.workflow.findFirst({
        where: { tabId: tabId, isActive: true },
      });

      return workflowActive;
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

  private getSentimentType(data, sentimentValue: number) {
    let sentiment: string = null;
    Object.keys(data).forEach((key) => {
      const range = data[key];
      if (sentimentValue >= range.min && sentimentValue < range.max) {
        sentiment = key;
      }
    });

    return sentiment;
  }

  private async callService(
    flowId: string,
    messageId: string,
    nodeType: string,
    optData = null,
  ) {
    const flowData = await this.dataService.getWorkflowData(flowId, messageId);
    const data = { ...JSON.parse(flowData.data), ...optData };

    switch (nodeType) {
      case WorkflowNodeType.ReceiveMessage:
        break;
      case WorkflowNodeType.SentimentAnalysis:
        this.httpService
          .post(`http://localhost:8000/sentiment`, data)
          .subscribe();
        break;
      case WorkflowNodeType.ResponseMessage:
        this.httpService
          .post(`http://localhost:8000/reply-message`, data)
          .subscribe();
        break;
      case WorkflowNodeType.NotifyAgent:
        break;
    }
  }
}
