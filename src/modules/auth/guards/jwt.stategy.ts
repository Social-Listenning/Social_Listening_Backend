import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/users/services/user.service';
import { SettingService } from 'src/modules/setting/service/setting.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly settingService: SettingService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          const tokenSecret = (
            await settingService.getSettingByKeyAndGroup(
              'TOKEN_SECRET',
              'ACTIVATE_ACCOUNT',
            )
          )?.value;
          done(null, tokenSecret);
        } catch (error) {
          console.log(error);
          done(error);
        }
      },
    });
  }

  async validate(payload) {
    return this.userService.getUserInfo(payload.id);
  }
}
