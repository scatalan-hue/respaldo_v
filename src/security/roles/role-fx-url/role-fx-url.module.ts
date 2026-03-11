import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleFxUrl } from './entities/role-fx-url.entity';
import { RoleFxUrlService } from './services/role-fx-url.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleFxUrl])],
  providers: [RoleFxUrlService],
})
export class RolesFxUrlModule {}
