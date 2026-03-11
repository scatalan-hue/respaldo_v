import { Body, Controller, Get, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentContext } from '../../../patterns/crud-pattern/decorators/current-context.decorator';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { CreateFileBase64Input } from '../dto/inputs/create-file-base64.input';
import { CreateFileBySourceInput } from '../dto/inputs/create-file-by-source.input';
import { CreateFileInput } from '../dto/inputs/create-file.input';
import { FileInfo } from '../entities/file-info.entity';
import { FilesManagerService } from '../services/files-manager.service';
import { FilesService } from '../services/files.service';

@Controller('/attachment/files')
@ApiTags('Attachments')
export class FilesController {
  constructor(
    private filesService: FilesService,
    private filesManagerService: FilesManagerService,
  ) {}

  @Post('')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('file'))
  async upload(@CurrentContext() context: IContext, @UploadedFiles() files) {
    const uploadFiles: Promise<FileInfo>[] = files.map(async (file) => {
      const fileArgs: CreateFileInput = {
        fileName: file.originalname,
        fileBuffer: file.buffer,
        fileMongoId: file.id?.toString(),
      };

      const fileResponse = await this.filesService.create(context, fileArgs);
      return fileResponse;
    });

    return await Promise.all(uploadFiles);
  }

  @Post('uploadFileBase64')
  uploadFileBase64(@CurrentContext() context: IContext, @Body() createFileBase64Input: CreateFileBase64Input) {
    return this.filesService.createFileBase64(context, createFileBase64Input);
  }

  @Post('findOrCreateFileBySource')
  findOrCreateFileBySource(@CurrentContext() context: IContext, @Body() createFileBase64Input: CreateFileBySourceInput) {
    return this.filesService.findOrCreateFileBySource(context, createFileBase64Input);
  }

  @Get('download/:id')
  async download(@CurrentContext() context: IContext, @Param('id') id: string, @Res() res: Response) {
    return await this.filesService.download(context, id, res);
  }

  @Get('static/:id.:ext')
  async static(@CurrentContext() context: IContext, @Param('id') id: string, @Param('ext') ext: string, @Res() res: Response) {
    await this.filesService.static(context, id, ext, res);
  }
}
