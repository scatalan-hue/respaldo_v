import { ErrorsEditingTransactionsService } from './services/generate-error-template/errors-editing-transactions.service';
import { TransactionCorrectionExcelService } from './services/edit-transaction/correction-transaction-excel.service';
import { GetErrorDBService } from './services/generate-error-template/generate-error-transaction.service';
import { CorrectionRowProcessor } from './services/edit-transaction/correction-load.procesor.service';
import { TransactionLoadTemplateService } from './services/transaction-load-template.service';
import { BatchProcessorService } from './services/save_transaction/batch-processor.service';
import { TransactionLoadService } from './services/save_transaction/excel-loader.service';
import { SaveExcelRowService } from './services/save_transaction/transactional.service';
import { ExcelErrorWriterService } from 'src/common/functions/excel/excel-error-writer';
import { SaveExcelService } from './services/save_transaction/save-data-excel.service';
import { ExcelRowLoader } from './services/edit-transaction/excel-row.loader.service';
import { TransactionCorrectionResolver } from './resolvers/correction.resolver';
import { TransactionLoadResolver } from './resolvers/transaction-load.resolver';
import { TransactionLoadEntity } from './entities/transaction-load.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { transactionLoadQuee } from './constants/events.constants';
import { ObtainErrorResolver } from './resolvers/error.resolver';
import { Taxpayer } from '../../taxpayer/entity/taxpayer.entity';
import { FilesModule } from 'src/general/files/files.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    FilesModule,
    TypeOrmModule.forFeature([
      TransactionLoadEntity,
      Transaction,
      Taxpayer,
    ]),
    // BullModule.registerQueue({
    //   name: transactionLoadQuee,
    // })

  ],

  providers: [
    TransactionCorrectionExcelService,
    ErrorsEditingTransactionsService,
    TransactionLoadTemplateService,
    TransactionCorrectionResolver,
    ExcelErrorWriterService,
    TransactionLoadResolver,
    TransactionLoadService,
    CorrectionRowProcessor,
    BatchProcessorService,
    ObtainErrorResolver,
    SaveExcelRowService,
    GetErrorDBService,
    SaveExcelService,
    ExcelRowLoader,

  ],
  exports: []
})
export class TransactionLoadModule { }