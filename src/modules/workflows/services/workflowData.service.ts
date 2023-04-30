import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';
import { PrismaService } from 'src/config/database/database.config.service';
import { WorkflowService } from './workflow.service';
import { SocialTabService } from 'src/modules/socialGroups/services/socialTab.service';
import { SocialMessageService } from 'src/modules/socialMessage/services/socialMessage.service';
import { SocialPostService } from 'src/modules/socialMessage/services/socialPost.service';

@Injectable()
export class WorkflowDataService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly tabService: SocialTabService,
    @Inject(forwardRef(() => WorkflowService))
    private readonly workflowService: WorkflowService,
    private readonly messageService: SocialMessageService,
    private readonly postService: SocialPostService,
  ) {}

  async updateData(workflowId: string, messageId: string, data) {
    try {
      const workflowData = await this.getWorkflowData(workflowId, messageId);
      if (workflowData) {
        const oldWorkflowData = JSON.parse(workflowData?.data);
        const newWorkflowData = {
          ...oldWorkflowData,
          ...data,
        };

        const updatedData = await this.prismaService.workflowData.update({
          where: { id: workflowData.id },
          data: { data: JSON.stringify(newWorkflowData) },
        });

        return updatedData;
      } else {
        const message = await this.messageService.findCommentById(messageId);
        const rootMessage = await this.messageService.getRootMessage(messageId);
        const workflow = await this.workflowService.getWorkflowById(workflowId);
        const tabData = await this.tabService.getSocialTabInfo(workflow.tabId);
        const post = await this.postService.getSocialPostById(
          rootMessage.parentId,
        );
        const pageInfo = JSON.parse(tabData.SocialNetwork.extendData);
        const optionData = {
          ...data,
          postId: post.postId,
          fb_message_id: message.messageId,
          pageId: pageInfo.id,
          token: pageInfo.accessToken,
        };

        const newData = await this.prismaService.workflowData.create({
          data: {
            flowId: workflowId,
            messageId: messageId,
            data: JSON.stringify(optionData),
          },
        });

        return newData;
      }
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }

  async getWorkflowData(workflowId: string, messageId: string) {
    try {
      const workflowData = await this.prismaService.workflowData.findFirst({
        where: { flowId: workflowId, messageId: messageId },
      });
      return workflowData;
    } catch (error) {
      throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);
    }
  }
}
