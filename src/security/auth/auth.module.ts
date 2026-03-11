import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { config } from '../../config';
import { AuthController } from './controllers/auth.controller';
import { AuthResolver } from './resolver/auth.resolver';
import { AuthNotificationService } from './service/auth.notification.service';
import { AuthService } from './service/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Global()
@Module({
  providers: [AuthResolver, AuthService, JwtStrategy, AuthNotificationService],
  exports: [JwtStrategy, PassportModule, JwtModule, AuthService],
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => ({
        secret: configService.jwt.secret,
        signOptions: {
          expiresIn: configService.jwt.expiresIn,
        },
      }),
    }),
  ],
  controllers: [AuthController],
})
export class AuthModule { }
