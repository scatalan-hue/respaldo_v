import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../../files/files.module';
import { Document } from './entities/document.entity';
import { DocumentResolver } from './resolvers/document.resolver';
import { DocumentManagerService } from './services/document.manager.service';
import { DocumentService } from './services/document.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), FilesModule, HttpModule],
  providers: [DocumentResolver, DocumentService, DocumentManagerService],
  exports: [DocumentManagerService],
})
export class DocumentModule {}
