import { Module } from '@nestjs/common';
import { TemplateResolver } from './resolvers/template.resolver';
import { TemplateService } from './services/template.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from './entities/template.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Template]), HttpModule],
  providers: [TemplateResolver, TemplateService],
  exports: [TemplateService],
})
export class TemplateModule {}
