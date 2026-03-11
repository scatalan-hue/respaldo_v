import { IContext } from 'src/patterns/crud-pattern/interfaces/context.interface';
import { FilesService } from 'src/general/files/services/files.service';
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class TransactionLoadTemplateService {
    constructor(
        private readonly filesService: FilesService
    ) { }

    async loadWorksheetFromBuffer(context: IContext, workbook: ExcelJS.Workbook, filename: string
    ) {
        const buffer = await workbook.xlsx.writeBuffer();
        return this.filesService.uploadBuffer(
            context,
            Buffer.from(buffer as any),
            filename
        );
    }
}

