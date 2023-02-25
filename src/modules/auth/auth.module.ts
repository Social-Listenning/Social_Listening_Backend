import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UserModule } from '../users/user.module';
import { QueueModule } from '../queue/queue.module';
import { SettingModule } from '../setting/setting.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './guards/local.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    UserModule,
    QueueModule,
    SettingModule,
    JwtModule.register({}),
    PassportModule,
  ],
  providers: [AuthService, LocalStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
