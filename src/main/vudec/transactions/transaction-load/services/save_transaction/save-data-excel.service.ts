import { IContext } from "src/patterns/crud-pattern/interfaces/context.interface";
import { EXCEL_CONFIG } from "../../constants/edit-transaction.constants";
import { TransactionRowDto } from "../../types/save-transaction.type";
import { SaveExcelRowService } from "./transactional.service";
import { Injectable, Logger } from "@nestjs/common";
import pMap from "p-map";

@Injectable()
export class SaveExcelService {

    private readonly logger = new Logger(SaveExcelService.name);
    constructor(private readonly saveExcelRowService: SaveExcelRowService) { }

    async insertExcelInfo(rows: { rowNumber: number; dto: TransactionRowDto }[], context: IContext) {

        const results = await pMap(rows, async ({ rowNumber, dto }) => {
            try {
                const data = await this.saveExcelRowService.processRow(dto, context);

                return {
                    rowNumber,
                    row: dto,
                    success: true,
                    data,
                };
            } catch (error) {
                this.logger.error(
                    `Error guardando fila Excel ${rowNumber}: ${error.message}`,
                    error.stack,
                );

                return {
                    rowNumber,
                    row: dto,
                    success: false,
                    error: error.message,
                };
            }
        },
            { concurrency: EXCEL_CONFIG.CONCURRENCY }
        );
        const failures = results.filter(r => !r.success);
        const successCount = results.filter(r => r.success).length;

        return {
            total: results.length,
            successCount,
            failedCount: failures.length,
            failures,
            results,
        };
    }
}