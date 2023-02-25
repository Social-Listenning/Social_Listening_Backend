import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { UserService } from 'src/modules/users/services/user.service';
import { RegisterDTO } from '../dtos/register.dto';
import { EmailQueueService } from 'src/modules/queue/services/email.queue.service';
import { VerificationTokenPayload } from '../dtos/verificationToken.payload';
import { SettingService } from 'src/modules/setting/service/setting.service';
import { JwtService } from '@nestjs/jwt';
import { ReturnResult } from 'src/common/models/dto/returnResult';
import { User } from 'src/modules/users/model/user.model';
import { comparePassword } from 'src/utils/hashPassword';
import { excludeData } from 'src/utils/excludeData';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly settingService: SettingService,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  async register(registerData: RegisterDTO) {
    let result = new ReturnResult<User>();
    try {
      registerData.email = registerData.email.toLowerCase();

      const userExist = await this.userService.getUserByEmail(
        registerData.email,
      );
      if (userExist) {
        throw new BadRequestException(
          `Email: ${registerData.email} exists. Try with another email`,
        );
      }

      const user = await this.userService.createUser(registerData);
      await this.sendVerificationLink(user.result?.email);
      result = user;
    } catch (error) {
      this.logger.error(`Function: registerAccount, Error: ${error.message}`);
      result.message = error.message;
    }
    return result;
  }

  async sendVerificationLink(email: string | null) {
    if (!email) return;

    const payload: VerificationTokenPayload = { email };
    const tokenSecretSetting =
      await this.settingService.getSettingByKeyAndGroup(
        'TOKEN_SECRET',
        'ACTIVATE_ACCOUNT',
      );
    const tokenExpireTime = await this.settingService.getSettingByKeyAndGroup(
      'TOKEN_EXPIRATION_TIME',
      'ACTIVATE_ACCOUNT',
    );
    const URLConfirm = await this.settingService.getSettingByKeyAndGroup(
      'EMAIL_CONFIRMATION_URL',
      'DOMAIN',
    );

    const token = this.jwtService.sign(payload, {
      secret: tokenSecretSetting.value,
      expiresIn: `${tokenExpireTime.value}s`,
    });

    const activateUrl = `${URLConfirm.value}/?token=${token}`;

    return this.emailQueueService.addEmailToQueue({
      to: email,
      subject: 'Welcome to My App!',
      template: './welcome',
      context: {
        activateUrl,
      },
    });
  }

  async decodeToken(token: string) {
    try {
      const tokenSecretSetting =
        await this.settingService.getSettingByKeyAndGroup(
          'TOKEN_SECRET',
          'ACTIVATE_ACCOUNT',
        );
      const payload = await this.jwtService.verify(token, {
        secret: tokenSecretSetting.value,
      });

      if (typeof payload === 'object' && 'email' in payload) {
        return payload.email;
      }
      throw new BadRequestException();
    } catch (error) {
      if (error?.name === 'TokenExpiredError') {
        throw new BadRequestException('Email confirmation token expired');
      }
      throw new BadRequestException('Bad confirmation token');
    }
  }

  async confirmEmail(email: string) {
    const user = await this.userService.getUserByEmail(email);
    if (user.isActive) {
      throw new BadRequestException('Email already confirmed');
    }
    return await this.userService.activeAccount(user.id);
  }

  async getAuthenticatedUser(email: string, hashedPassword: string) {
    const result = new ReturnResult<User>();
    try {
      const user = await this.userService.getUserByEmail(email);
      const isPasswordMatching = await comparePassword(
        hashedPassword,
        user.password,
      );

      if (!isPasswordMatching) throw new Error('Wrong credentials provided');
      result.result = excludeData(user, [
        'password',
        'createdAt',
        'updatedAt',
        'roleId',
        'deleteAt',
        'isActive',
      ]);
    } catch (error) {
      this.logger.log(`Email ${email} login account fail`);
      result.message = error.message;
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    return result;
  }

  async getJwtToken(userId: string, type = 'ACCESS_TOKEN') {
    const tokenSecretSetting =
      await this.settingService.getSettingByKeyAndGroup(
        'TOKEN_SECRET',
        'ACTIVATE_ACCOUNT',
      );
    const tokenExpireTime = await this.settingService.getSettingByKeyAndGroup(
      type === 'ACCESS'
        ? 'TOKEN_EXPIRATION_TIME'
        : 'REFRESH_TOKEN_EXPIRATION_TIME',
      'ACTIVATE_ACCOUNT',
    );

    const userData = await this.getUserInfo(userId);
    const payload = userData;
    const token = this.jwtService.sign(payload, {
      secret: tokenSecretSetting.value,
      expiresIn: `${tokenExpireTime.value}s`,
    });
    return token;
  }

  private async getUserInfo(userId: string) {
    return await this.userService.getUserInfo(userId);
  }
}
