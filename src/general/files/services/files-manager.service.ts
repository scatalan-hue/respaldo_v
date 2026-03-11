import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { GridFSBucketReadStream } from 'mongodb';
import { MongoGridFS } from 'mongo-gridfs';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as fs from 'fs-extra';
import * as path from 'path';
import { getMimeTypeFromExtension } from '../functions/content-type';
import { MongoFileInfo } from '../dto/models/file-info.model';
import { SaveToFileBase64 } from '../dto/args/file-b64.arg';
import { CreateFileBase64Input } from '../dto/inputs/create-file-base64.input';
import filetype from 'magic-bytes.js';

@Injectable()
export class FilesManagerService {
  private fileModel: MongoGridFS;

  constructor(
    @InjectConnection()
    @Optional()
    private readonly connection: Connection,
  ) {
    this.fileModel = new MongoGridFS(connection?.db as any, 'fs');
  }

  async readStream(id: string): Promise<GridFSBucketReadStream> {
    return await this.fileModel.readFileStream(id);
  }

  async uploadFileBuffer(buffer: Buffer, fileName: string) {
    try {
      const parseFileName = await this.parseFileName(buffer, fileName);
      const decodedFile = buffer;
      const tempFolder = path.join(__dirname, '..', 'temp');
      const filePath = path.join(tempFolder, `${parseFileName.fileName}.${parseFileName.fileExtension.toLowerCase()}`);
      const file = await fs.outputFile(filePath, decodedFile);
      const fileStream = fs.createReadStream(filePath);
      return await this.saveStream({
        filename: fileName,
        mimetype: getMimeTypeFromExtension(parseFileName.fileExtension),
        path: filePath,
      });
    } catch (error) {
      throw new Error(error.message);
    }
  }

  private async saveStream(file: SaveToFileBase64) {
    const fileReadStream = fs.createReadStream(file.path);
    const file_uploaded = await this.fileModel.writeFileStream(fileReadStream, {
      filename: file.filename,
      contentType: file.mimetype,
    });
    return file_uploaded._id.toString();
  }

  async findInfo(id: string): Promise<MongoFileInfo> {
    const result = await this.fileModel
      .findById(id)
      .catch((err) => {
        throw new NotFoundException('File not found');
      })
      .then((result) => result);
    return {
      filename: result.filename,
      length: result.length,
      chunkSize: result.chunkSize,
      md5: result.md5,
      contentType: result.contentType,
    };
  }

  async deleteFile(id: string): Promise<boolean> {
    return await this.fileModel.delete(id);
  }

  async donwloadFile(id: string): Promise<string> {
    return this.fileModel.downloadFile(id);
  }

  async parseFileName(buffer: Buffer, fileName: string) {
    const fileTypeDetection = filetype(buffer);
    const fileExtension = fileTypeDetection && fileTypeDetection.length ? fileTypeDetection[0] : null;
    const fileExtMatch = fileName.match(/\.[^.]*$/);
    const fileExt = fileExtMatch ? fileExtMatch[0] : '';
    const fileType = fileExt ? fileExt.slice(1) : '';

    const cleanedFileName = fileName
      .replace(fileExt, '')
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .trim();

    let resolvedExtension = fileExtension?.extension ?? fileType;

    // Si magic-bytes detecta 'zip' pero el nombre original termina en .xlsx,
    // preferimos devolver 'xlsx' porque los archivos .xlsx son contenedores zip.
    if (resolvedExtension === 'zip' && fileName.toLowerCase().endsWith('.xlsx')) {
      resolvedExtension = 'xlsx';
    }

    return {
      fileName: cleanedFileName,
      fileExtension: resolvedExtension,
    };
  }

  async downloadFileAndConvertToBuffer(id: string, orFail?: boolean): Promise<Buffer> {
    try {
      const stream = await this.fileModel.readFileStream(id);

      // Lee el contenido del stream y lo almacena en un buffer
      const chunks: Buffer[] = [];
      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (error) => reject(error));
      });
    } catch (error) {
      if (orFail) throw new NotFoundException('File not found');
      return;
    }
  }

  async uploadFileBase64(body: CreateFileBase64Input) {
    try {
      const decodedFile = Buffer.from(body.content, 'base64');
      const parseFileName = await this.parseFileName(decodedFile, body.filename);
      const tempFolder = path.join(__dirname, '..', 'temp');
      const filePath = path.join(tempFolder, `${parseFileName.fileName}.${parseFileName.fileExtension.toLowerCase()}`);
      const file = await fs.outputFile(filePath, decodedFile);
      const fileStream = fs.createReadStream(filePath);
      const resultFile = (await this.saveStream({
        filename: body.filename,
        mimetype: getMimeTypeFromExtension(parseFileName.fileExtension),
        path: filePath,
      } as SaveToFileBase64)) as string;
      return resultFile;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
