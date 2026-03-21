import { TRANSACTION_LOAD_TRANSACTION_ERROR_TEMPLATE_PATH } from "../../utils/exce-template-paths.utils";
import { loadWorkbookFromPath } from "src/common/functions/excel/load-workbook-from-path";
import { GET_FAILED_TRANSACTIONS } from "../../entities/queries/transaction-load.query";
import { TransactionLoadTemplateService } from "../transaction-load-template.service";
import { IQueryResult } from "../../interfaces/generate-error-template.interface";
import { IContext } from "src/patterns/crud-pattern/interfaces/context.interface";
import { EXCEL_CONFIG } from "../../constants/excel.constants";
import { Injectable, NotFoundException } from "@nestjs/common";
import { DataSource } from "typeorm";

@Injectable()
export class GetErrorDBService {


    constructor(
        private readonly dataSource: DataSource,
        private readonly templateService: TransactionLoadTemplateService,
    ) { }

    // Una vez que tienes la query SQL lista y probada, debes integrarla en tu aplicación NestJS.
    // Básicamente crearás un método en el servicio correspondiente que ejecute tu consulta SQL -
    // utilizando el repositorio de TypeORM o el método de ejecución de queries que use tu proyecto.
    private async getQuery(): Promise<IQueryResult[]> {
        const result = await this.dataSource.query(GET_FAILED_TRANSACTIONS);
        if (result.length === 0) throw new NotFoundException('ERROR IN (GetErrorDBService) la consulta no trae datos') //FIXME: No se si esto deberia parar la ejecucion del proyecto arreglar mas tarde.
        return result;
    }

    // Con los datos obtenidos de la query, el siguiente paso es llenar la plantilla excel
    //  guardada en el aplicativo con los registros obtenidos en el excel.

    private async exportQueryResultsToExcelTemplate(context: IContext, fileName: string) {
        const data = await this.getQuery();
        const workbook = await loadWorkbookFromPath(TRANSACTION_LOAD_TRANSACTION_ERROR_TEMPLATE_PATH);
        const worksheet = workbook.worksheets[0] || workbook.getWorksheet(1);

        let rowIndex = EXCEL_CONFIG.START_ROW;

        for (const row of data) {
            worksheet.addRow([
                row.item,
                row.contractNumber,
                row.taxpayerNumber,
                row.validation,
                row.message,
                '',
                ''
            ])
            rowIndex++;
        }
        return await this.templateService.loadWorksheetFromBuffer(context, workbook, fileName)
    }

    async generateErrorExcel(context: IContext): Promise<{ fileId: string }> {
        const fileName = `TransactionErrors${Date.now()}.xlsx`;
        const fileInfo = await this.exportQueryResultsToExcelTemplate(context, fileName)
        return { fileId: fileInfo.id };
    }
}
