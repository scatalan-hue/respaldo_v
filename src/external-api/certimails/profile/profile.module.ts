import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ProfileManagerService } from './services/profile.manager.service';
import { ProfileService } from './services/profile.service';
import { Profile } from './entities/profile.entity';
import { ProfileResolver } from './resolvers/profile.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), HttpModule],
  providers: [ProfileService, ProfileManagerService, ProfileResolver],
  exports: [ProfileService],
})
export class ProfileModule {}
