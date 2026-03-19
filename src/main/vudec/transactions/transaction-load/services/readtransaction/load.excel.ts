import { loadInputWorksheet } from "src/common/functions/excel/load-input-worksheet";
import { IContext } from "src/patterns/crud-pattern/interfaces/context.interface";
import { FilesService } from "src/general/files/services/files.service";

export class LoadExcelCorrection {
    constructor(
        private readonly fileService: FilesService,
    ) { }

    public async loadExcelData(context: IContext, fileId: string) {

        const fileData = await this.fileService.findBuffer(context, fileId, true);
        const inputWorksheet = loadInputWorksheet(fileData.buffer);

    }
}