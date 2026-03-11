import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';
import { Filter } from '../../../../common/report/dynamic-filter';
import { IContext } from '../../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { FilesService } from '../../../files/services/files.service';
import { createExcelReportEvent, createExcelReportUrlEvent } from '../constants/events.constants';
import { CreateDocumentInput } from '../dto/inputs/create-document.input';
import { UpdateDocumentInput } from '../dto/inputs/update-document.input';
import { Document } from '../entities/document.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: Document,
  createInputType: CreateDocumentInput,
  updateInputType: UpdateDocumentInput,
});

@Injectable()
export class DocumentService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly filesService: FilesService) {
    super();
  }

  private configureWorksheet(worksheet: ExcelJS.Worksheet, fields: Filter[]): void {
    worksheet.columns = fields
      .filter((it) => it.reportOpt) // Filtrar solo aquellos con reportOpt válido
      .map((it) => ({
        header: it.reportOpt.columnName ?? it.fieldName,
        key: it.filterName,
        width: it.reportOpt.columnWidth ?? 30,
        hidden: it.reportOpt.columnHidden,
        style: { numFmt: it.reportOpt.columnFmt },
      }));
  }

  private addRowsToWorksheet(worksheet: ExcelJS.Worksheet, data: any[]): void {
    data.forEach((item) => worksheet.addRow(item));
  }

  private applyCellStyles(worksheet: ExcelJS.Worksheet, fields: Filter[]): void {
    for (const column of worksheet.columns as ExcelJS.Column[]) {
      if (!column.key) continue;

      const field = fields.find((x) => x.filterName === column.key);
      if (!field) continue;

      column.eachCell((cell, rowNumber) => {
        const styleConfig =
          rowNumber === 1
            ? field.reportOpt?.colConfig // Configuración para cabeceras
            : field.reportOpt?.cellConfig; // Configuración para celdas normales

        if (styleConfig) {
          cell.style = {
            ...cell.style,
            border: styleConfig.cellBorder,
            fill: styleConfig.cellFill,
            font: styleConfig.cellFont,
          };
        }
      });
    }
  }

  private async saveWorkbookToFile(context: IContext, workbook: ExcelJS.Workbook, fileName: string): Promise<string> {
    const buffer = (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
    return this.filesService.saveToTempFolder(context, undefined, false, buffer, fileName, 'xlsx');
  }

  async createExcelReport(context: IContext, data: any[], fileName: string, sheetName: string, fields: Filter[]): Promise<ExcelJS.Workbook> {
    // const filePath = path.join(process.cwd(), 'dist', 'general', 'temp', `${fileName}.xlsx`).replace(/\\/g, '/');

    // const directory = path.dirname(filePath);
    // if (!fs.existsSync(directory)) {
    //   fs.mkdirSync(directory, { recursive: true }); // Crea todos los directorios necesarios
    // }

    // if (!fs.existsSync(filePath)) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    this.configureWorksheet(worksheet, fields); // Configurar columnas
    this.addRowsToWorksheet(worksheet, data); // Agregar datos
    this.applyCellStyles(worksheet, fields); // Aplicar estilos

    // const buffer = (await workbook.xlsx.writeBuffer()) as Buffer;

    //   fs.writeFileSync(filePath, buffer);
    // }

    return workbook;
  }

  async createExcelUrlReport(context: IContext, data: any[], fileName: string, sheetName: string, fields: Filter[]): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    this.configureWorksheet(worksheet, fields); // Configurar columnas
    this.addRowsToWorksheet(worksheet, data); // Agregar datos
    this.applyCellStyles(worksheet, fields); // Aplicar estilos

    const tempUrl = await this.saveWorkbookToFile(context, workbook, fileName);

    const { APP_URL, APP_PORT } = process.env;
    return tempUrl ? `${APP_URL}:${APP_PORT}${tempUrl}` : '';
  }

  @OnEvent(createExcelReportUrlEvent)
  async onCreateExcelUrlReport({
    context,
    data,
    fields,
    fileName,
    sheetName,
  }: {
    context: IContext;
    data: any;
    fileName: string;
    fields: Filter[];
    sheetName: string;
  }): Promise<String> {
    return this.createExcelUrlReport(context, data, fileName, sheetName, fields);
  }

  @OnEvent(createExcelReportEvent)
  async onCreateExcelReport({
    context,
    data,
    fields,
    fileName,
    sheetName,
  }: {
    context: IContext;
    data: any;
    fileName: string;
    fields: Filter[];
    sheetName: string;
  }): Promise<ExcelJS.Workbook> {
    return this.createExcelReport(context, data, fileName, sheetName, fields);
  }
}
