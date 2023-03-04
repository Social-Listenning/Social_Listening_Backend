import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SocialGroupService } from '../services/socialGroup.service';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { SocialGroup } from '../models/socialGroup.model';
import { RoleGuard } from 'src/modules/auth/guards/role.guard';
import { EditSocialGroupDTO } from '../dtos/socialGroup.dto';

@Controller('socialGroup')
export class SocialGroupController {
  constructor(private readonly socialGroupService: SocialGroupService) {}

  @Get()
  @UseGuards(RoleGuard('OWNER'))
  async getSocialGroup(@Req() request: RequestWithUser) {
    const user = request.user;
    const result = new ReturnResult<SocialGroup>();
    try {
      const socialGroup =
        await this.socialGroupService.getSocialGroupByManagerId(user.id);
      if (socialGroup) result.result = socialGroup;
      else throw new Error();
    } catch (error) {
      result.message = 'No social group found';
    }
    return result;
  }

  @Put('/:id')
  @UseGuards(RoleGuard('OWNER'))
  async updateSocialGroup(
    @Req() request: RequestWithUser,
    @Param() { id },
    @Body() data: EditSocialGroupDTO,
  ) {
    const user = await request.user;
    const result = new ReturnResult<SocialGroup>();
    try {
      const group = await this.socialGroupService.getSocialGroupById(id);
      if (!group) throw new Error(`Not found social group`);
      else if (group.managerId !== user.id) {
        console.log(group, user.id);
        throw new Error(`Something went wrong`);
      }

      const updatedSocialGroup = await this.socialGroupService.editSocialGroup({
        ...data,
        id: group.id,
      });
      result.result = updatedSocialGroup;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
