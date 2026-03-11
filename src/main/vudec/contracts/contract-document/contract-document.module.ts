import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractDocument } from './entities/contract-document.entity';
import { ContractDocumentService } from './services/contract-document.service';
import { ContractDocumentResolver } from './resolvers/contract-document.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ContractDocument])],
  providers: [ContractDocumentService, ContractDocumentResolver],
  exports: [ContractDocumentService],
})
export class ContractDocumentModule {}
