import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserKey } from './entities/user-key.entity';
import { UserKeyResolver } from './resolvers/user-key.resolver';
import { UsersKeyService } from './services/users-key.service';
@Module({
  imports: [TypeOrmModule.forFeature([UserKey])],
  providers: [UsersKeyService, UserKeyResolver],
  exports: [UsersKeyService],
})
export class UserKeyModule {}
