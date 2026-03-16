import { IContext } from "src/patterns/crud-pattern/interfaces/context.interface";
import { TransactionRowDto } from "../../validators/save-transaction.validator";
import { SaveExcelRowService } from "./transactional.service";
import { Injectable, Logger } from "@nestjs/common";
import pMap from "p-map";

@Injectable()
export class SaveExcelService {

    private readonly logger = new Logger(SaveExcelService.name);

    constructor(private readonly rowService: SaveExcelRowService) { }

    async insertExcelInfo(rows: TransactionRowDto[], context: IContext) {

        const CONCURRENCY = 1;

        return await pMap(rows, async (row, index) => {

            try {
                return await this.rowService.processRow(row, context);
            } catch (error) {

                this.logger.error(`Error guardando fila ${index + 1}: ${error.message}`);

                return {
                    row,
                    success: false,
                    error: error.message
                };
            }
        },
            { concurrency: CONCURRENCY }
        );
    }
}