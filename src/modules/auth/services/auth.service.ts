import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UserService } from 'src/modules/users/services/user.service';
import { RegisterDTO } from '../dtos/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly userService: UserService) {}

  async register(registerData: RegisterDTO) {
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
      return user;
    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }
}
