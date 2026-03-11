import { Module } from '@nestjs/common';
import { ContractModule } from './contracts/contract/contract.module';
import { LotContractModule } from './lots/lot-contract/lot-contract.module';
import { LotModule } from './lots/lot/lot.module';
import { MovementModule } from './movement/movement.module';
import { OrganizationProductModule } from './organizations/organization-product/organization-product.module';
import { OrganizationTaxpayerModule } from './organizations/organization-taxpayer/organization-taxpayer.module';
import { OrganizationUserModule } from './organizations/organization-user/organization-user.module';
import { OrganizationModule } from './organizations/organization/organization.module';
import { ProductModule } from './product/product.module';
import { TaxpayerModule } from './taxpayer/taxpayer.module';
import { ContractHistoryModule } from './contracts/contract-history/contract-history.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ContractDocumentModule } from './contracts/contract-document/contract-document.module';

@Module({
  imports: [
    OrganizationModule,
    ContractModule,
    ContractHistoryModule,
    ContractDocumentModule,
    TaxpayerModule,
    MovementModule,
    ProductModule,
    OrganizationProductModule,
    OrganizationUserModule,
    LotModule,
    LotContractModule,
    OrganizationTaxpayerModule,
    TransactionsModule
  ],
})
export class VudecModule {}
