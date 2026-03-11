import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentTypeResolver } from './resolver/documentType.resolver';
import { DocumentTypeService } from './services/documentType.service';
import { DocumentType } from './entities/documentType.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentType])],
  providers: [DocumentTypeService, DocumentTypeResolver],
})
export class DocumentTypeModule {}
