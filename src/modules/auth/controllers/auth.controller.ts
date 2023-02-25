import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDTO } from '../dtos/register.dto';
import { ConfirmEmailDTO } from '../dtos/comfirmEmail.dto';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { RequestWithUser } from '../interface/requestWithUser.interface';
import { LocalAuthGuard } from '../guards/localAuth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() registrationData: RegisterDTO) {
    return this.authService.register(registrationData);
  }

  @Post('/confirm-email')
  async confirm(@Body() data: ConfirmEmailDTO): Promise<ReturnResult<boolean>> {
    const result = new ReturnResult<boolean>();
    try {
      const email = await this.authService.decodeToken(data.token);
      result.result = await this.authService.confirmEmail(email);
    } catch (error) {
      result.message = error.message;
    }
    return result;
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser) {
    const user = request.user;
    const access = await this.authService.getJwtToken(user.id, 'ACCESS');
    const refresh = await this.authService.getJwtToken(user.id, 'REFRESH');
    return {
      accessToken: access,
      refreshToken: refresh,
    };
  }
}
