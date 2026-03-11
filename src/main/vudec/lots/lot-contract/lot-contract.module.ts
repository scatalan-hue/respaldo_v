import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotContract } from './entities/lot-contract.entity';
import { LotContractResolver } from './resolvers/lot-contract.resolver';
import { LotContractService } from './services/lot-contract.service';

@Module({
  imports: [TypeOrmModule.forFeature([LotContract])],
  providers: [LotContractService, LotContractResolver],
  exports: [LotContractService],
})
export class LotContractModule {}
