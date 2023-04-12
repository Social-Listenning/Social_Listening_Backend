import { Controller, Get, Param } from '@nestjs/common';
import { SocialPostService } from '../services/socialPost.service';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { PostWithInfo } from '../dtos/postWithInfo.dto';

@Controller('social-post')
export class SocialPostController {
  constructor(private readonly socialPostService: SocialPostService) {}

  @Get('/:tabId')
  async getAllPost(@Param() { tabId }) {
    const result = new ReturnResult<PostWithInfo[]>();
    try {
      const listPosts = await this.socialPostService.getAllPostWithTabId(tabId);
      result.result = listPosts;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
