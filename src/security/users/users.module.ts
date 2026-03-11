import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserController } from './controllers/user.controller';
import { UserToken } from './entities/user-token.entity';
import { User } from './entities/user.entity';
import { UserView } from './entities/views/user.view.entity';
import { UsersResolver } from './resolvers/users.resolver';
import { UserViewResolver } from './resolvers/views/user.view.resolver';
import { UsersTokenService } from './services/users-token.service';
import { UsersNotificationService } from './services/users.notification.service';
import { UsersService } from './services/users.service';
import { UserViewService } from './services/views/user.view.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, UserToken, UserView]), AuthModule],
  providers: [UsersResolver, UsersService, UsersNotificationService, UsersTokenService, UserViewService, UserViewResolver],
  exports: [UsersService, UserViewService],
  controllers: [UserController],
})
export class UsersModule {}
