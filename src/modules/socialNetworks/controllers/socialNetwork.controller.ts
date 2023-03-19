import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { SocialNetworkService } from '../services/socialNetwork.service';
import { RequestWithUser } from 'src/modules/auth/interface/requestWithUser.interface';
import { ConnectSocialNetworkDTO } from '../dtos/socialNetwork.dto';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { SocialNetworkPerm } from '../enum/permission.enum';
import { SocialGroupService } from 'src/modules/socialGroups/services/socialGroup.service';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { ResponseMessage } from 'src/common/enum/ResponseMessage.enum';

@Controller('socialNetwork')
export class SocialNetworkController {
  constructor(
    private readonly groupService: SocialGroupService,
    private readonly socialNetworkService: SocialNetworkService,
  ) {}

  @Post('/connect')
  @UseGuards(PermissionGuard(SocialNetworkPerm.connectSocialNetwork.permission))
  async connectSocialNetwork(
    @Req() request: RequestWithUser,
    @Body() socialNetwork: ConnectSocialNetworkDTO,
  ) {
    const user = request.user;
    const result = new ReturnResult<object>();

    try {
      const group = await this.groupService.getSocialGroupByManagerId(user.id);
      if (!group)
        throw new Error(`You don't have permission to connect social network`);

      const socialNetworkCreated =
        await this.socialNetworkService.connectSocialNetwork(socialNetwork);
      if (!socialNetworkCreated)
        throw new Error(ResponseMessage.MESSAGE_TECHNICAL_ISSUE);

      const socialTabCreated = await this.groupService.createNewTab({
        name: socialNetworkCreated.name,
        groupId: group.id,
        socialId: socialNetworkCreated.id,
      });

      result.result = socialNetworkCreated;
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }
}
