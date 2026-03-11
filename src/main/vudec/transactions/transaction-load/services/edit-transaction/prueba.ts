// import { CorrectionRowValidator } from "../../validators/correction-row-transacation.validator";
// import { ExcelRowError, ProcessResult } from "../../interfaces/transaction-load.interface";
// import { TransactionLoadTemplateService } from "../process-rows/transaction-load-template.service";
// import { ValidationResponse } from "../../../transaction/enum/validation-response.enum";
// import { TransactionStatus } from "../../../transaction/enum/transaction-status.enum";
// import { Transaction } from "../../../transaction/entities/transaction.entity";
// import { Taxpayer } from "src/main/vudec/taxpayer/entity/taxpayer.entity";
// import { Normalize } from "../../validators/transaction-load.validators";
// import { IContext } from "src/patterns/crud-pattern/interfaces/context.interface";
// import { BATCH_SIZE } from "../../constants/excel.constants";
// import { EXCEL_COLUMNS } from "../../config/excel.config";
// import { ExcelRowData } from "../../types/excel-row.type";
// import { TRANSACTION_LOAD_USER_DATA_ERROR_TEMPLATE_PATH } from "../../config/paths.config";
// import { loadWorkbookFromPath } from "src/common/functions/excel/load-workbook-from-path";
// import { InjectRepository } from "@nestjs/typeorm";
// import { Injectable } from "@nestjs/common";
// import { Repository } from "typeorm";
// import { Row } from "exceljs";

// @Injectable()
// export class CorrectionRowProcessor {

//     constructor(
//         @InjectRepository(Transaction)
//         private readonly transactionRepository: Repository<Transaction>,
//         private readonly validator: CorrectionRowValidator,
//         private readonly templateService: TransactionLoadTemplateService,
//     ) { }

//     async processCorrectionRows(rows: ExcelRowData[], transactionMap: Map<string, Transaction>): Promise<{
//         transactionsToUpdate: Transaction[];
//         taxpayersToUpdate: Map<string, string>;
//         errors: ExcelRowError[];
//     }> {

//         const errors: ExcelRowError[] = [];
//         const transactionsToUpdate: Transaction[] = [];
//         const taxpayersToUpdate = new Map<string, string>();

//         for (const { row, rowNumber } of rows) {

//             const result = await this.processRow(
//                 row,
//                 rowNumber,
//                 transactionMap,
//                 taxpayersToUpdate
//             );

//             if (!result.success) {
//                 if (result.error) errors.push(result.error);
//             } else if (result.transaction) {
//                 transactionsToUpdate.push(result.transaction);
//             }
//         }
//         return { transactionsToUpdate, taxpayersToUpdate, errors };
//     }

//     async processRow(row: Row, rowNumber: number, transactionMap: Map<string, Transaction>, taxpayersToUpdate: Map<string, string>): Promise<ProcessResult> {

//         const transactionId = Normalize(row.getCell(EXCEL_COLUMNS.TRANSACTION_ID).value);
//         const newContractNumber = Normalize(row.getCell(EXCEL_COLUMNS.CONTRACT_NUMBER).value);
//         const newTaxpayerNumber = Normalize(row.getCell(EXCEL_COLUMNS.TAXPAYER_NUMBER).value);

//         //validar que los datos principales existan
//         let errorValidation = this.validator.ValidateExistingData(transactionId, newContractNumber, rowNumber);

//         if (errorValidation) return { success: false, error: errorValidation }

//         const transaction = transactionMap.get(transactionId);

//         errorValidation = this.validator.validateTransactionExists(transaction, transactionId, rowNumber);
//         if (errorValidation) return { success: false, error: errorValidation }

//         errorValidation = this.validator.validateContractNumber(newContractNumber, rowNumber);
//         if (errorValidation) return { success: false, error: errorValidation }

//         errorValidation = this.validator.validateTaxpayerAssociation(transaction, rowNumber);
//         if (errorValidation) return { success: false, error: errorValidation }

//         errorValidation = this.validator.validateTaxpayerNumber(newTaxpayerNumber, rowNumber);
//         if (errorValidation) return { success: false, error: errorValidation }

//         if (newTaxpayerNumber) {
//             errorValidation = this.validator.validateTaxpayerNumber(newTaxpayerNumber, rowNumber)
//             if (errorValidation) return { success: false, error: errorValidation }
//         }
//         try {
//             const updateTransaction = this.updateTransaction(transaction, newContractNumber, newTaxpayerNumber);

//             if (newTaxpayerNumber) {
//                 taxpayersToUpdate.set(transaction.taxpayerId, newTaxpayerNumber);
//             }
//             return { success: true, transaction: updateTransaction }

//         } catch (error) {
//             return { success: false, error: { row: rowNumber, message: error.message } }
//         }
//     }
//     updateTransaction(transaction: Transaction, newContractNumber: string, newTaxpayerNumber: string): Transaction | ProcessResult {
//         transaction.contractNumber = newContractNumber.toUpperCase();
//         if (transaction.data) {
//             try {
//                 const dataJson = JSON.parse(transaction.data);
//                 dataJson.consecutive = newContractNumber.toUpperCase();
//                 if (newTaxpayerNumber) {
//                     transaction.taxpayer.taxpayerNumber = newTaxpayerNumber;
//                     dataJson.taxpayerInput.taxpayerNumber = newTaxpayerNumber;
//                 }
//                 transaction.data = JSON.stringify(dataJson);
//             } catch (error) {
//                 throw new Error('JSON invalido en data')
//             }
//         }
//         transaction.status = TransactionStatus.PENDING;
//         transaction.validation = ValidationResponse.PENDING;
//         transaction.message = '';

//         return transaction;
//     }

//     async persistChanges(transactionsToUpdate: Transaction[], taxpayersToUpdate: Map<string, string>): Promise<void> {//FIXME

//         await this.transactionRepository.manager.transaction(async manager => {

//             if (transactionsToUpdate.length) {

//                 for (let i = 0; i < transactionsToUpdate.length; i += BATCH_SIZE) {
//                     const chunk = transactionsToUpdate.slice(i, i + BATCH_SIZE);

//                     await manager.save(Transaction, chunk, {
//                         chunk: BATCH_SIZE
//                     });
//                 }
//             }

//             if (taxpayersToUpdate.size) {

//                 const taxpayersArray = Array.from(taxpayersToUpdate.entries()).map(
//                     ([id, taxpayerNumber]) => ({
//                         id,
//                         taxpayerNumber
//                     })
//                 );

//                 for (let i = 0; i < taxpayersArray.length; i += BATCH_SIZE) {
//                     const chunk = taxpayersArray.slice(i, i + BATCH_SIZE);

//                     await manager.save(Taxpayer, chunk, {
//                         chunk: BATCH_SIZE
//                     });
//                 }
//             }
//         });
//     }

//     async generateErrorExcel(context: IContext, errors: ExcelRowError[], fileId: string): Promise<{ fileId: string } | null> {
//         if (errors.length === 0) return null;

//         try {
//             // Paso 1: Cargar la plantilla
//             const workbook = await loadWorkbookFromPath(TRANSACTION_LOAD_USER_DATA_ERROR_TEMPLATE_PATH);
//             const worksheet = workbook.worksheets[0] || workbook.getWorksheet(1);

//             const startRow = 3;
//             let rowIndex = startRow;

//             for (const error of errors) {
//                 const row = worksheet.addRow([
//                     error.row,           // Número de fila
//                     error.message,       // Mensaje de error
//                     '',
//                     '',
//                 ]);

//                 // Aplicar formato rojo para errores
//                 row.eachCell((cell, colNumber) => {
//                     if (colNumber === 2) { // Columna de mensaje
//                         cell.font = { bold: true, color: { argb: 'FFFF0000' } };
//                         cell.alignment = { vertical: 'top', wrapText: true };
//                         row.height = 25;
//                     }
//                     cell.alignment = { horizontal: 'center', vertical: 'middle' };
//                 });

//                 rowIndex++;
//             }

//             // Paso 3: Guardar el archivo usando FilesService a través de templateService
//             const resultFileInfo = await this.templateService.loadWorksheetFromBuffer(
//                 context,
//                 workbook,
//                 `correction_errors_${fileId}.xlsx`
//             );

//             return resultFileInfo?.id ? { fileId: resultFileInfo.id } : null;
//         } catch (error) {
//             console.error('Error generando Excel de errores:', error);
//             return null;
//         }
//     }
// }