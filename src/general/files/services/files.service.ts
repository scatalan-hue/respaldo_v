import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';
import { fromBuffer } from 'file-type';
import * as fs from 'fs';
import * as path from 'path';
import { I18N_SPACE } from '../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../common/i18n/functions/response';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { DataService } from '../../../patterns/crud-pattern/mixins/data-service.mixin';
import { CreateFileBase64Input } from '../dto/inputs/create-file-base64.input';
import { CreateFileBySourceInput } from '../dto/inputs/create-file-by-source.input';
import { CreateFileInput } from '../dto/inputs/create-file.input';
import { FileInfo } from '../entities/file-info.entity';
import { FileModes } from '../enums/file-modes.enum';
import { getMimeTypeFromExtension } from '../functions/content-type';
import { FilesManagerService } from './files-manager.service';
import { UploadService } from './upload.service';
import { STATIC_FILES_ROUTE } from '../../../common/constants/variables.constants';

@Injectable()
export class FilesService extends DataService(FileInfo) {
  constructor(
    private readonly filesManagerService: FilesManagerService,
    private readonly uploadService: UploadService, //@InjectModel('File') private readonly fileModel: Model<any>
  ) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.Files;

  /**
   * Crea un archivo en el sistema a partir de una URL
   * @param {IContext} context - Contexto de la aplicación
   * @param {string} fileUrl - URL del archivo a descargar
   * @param {Record<string, string>} headers - Encabezados HTTP opcionales para la petición
   * @returns {Promise<FileInfo>} Información del archivo creado
   */
  async createFileByUrl(context: IContext, fileUrl: string, headers?: Record<string, string>): Promise<FileInfo> {
    try {
      console.log(`Iniciando descarga desde URL: ${fileUrl}`);

      const { buffer, filename } = await this.getFileFromUrl(context, fileUrl, headers);

      console.log(`Descarga completada, procesando buffer para: ${filename}`);

      return await this.uploadBuffer(context, buffer, filename);
    } catch (error) {
      console.error(`Error completo en createFileByUrl:`, error);
      throw new BadRequestException(`Error al crear archivo desde URL: ${error.message}`);
    }
  }

  /**
   * Encuentra o crea un archivo a partir de diferentes fuentes (ID, base64, URL)
   * @param {IContext} context - Contexto de la aplicación
   * @param {CreateFileBySourceInput} fileInput - Información de entrada del archivo
   * @returns {Promise<FileInfo>} Información del archivo encontrado o creado
   */
  async findOrCreateFileBySource(context: IContext, fileInput: CreateFileBySourceInput): Promise<FileInfo> {
    const { fileId, fileBase64, filename, fileUrl } = fileInput;

    // Retornar el file por el id
    if (fileId) return await this.findOne(context, fileId);
    // Crear y retornar el file por el base64 y el nombre del file suministrado
    else if (fileBase64 && filename)
      return await this.createFileBase64(context, {
        content: fileBase64,
        filename,
      });
    // Obtener el file por la url suministrada, crear el file y retornarlo
    else if (fileUrl) return this.createFileByUrl(context, fileUrl);

    throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'findOrCreateFileBySource.fileNotFound'));
  }

  private async getFileFromUrl(context: IContext, url: string, headers?: any): Promise<{ buffer: Buffer; filename: string }> {
    try {
      console.log(`Intentando descargar archivo desde URL: ${url}`);

      // Configurar opciones de axios con timeout y validar certificados SSL
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: headers || {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        timeout: 30000, // 30 segundos de timeout
        maxContentLength: 50 * 1024 * 1024, // Límite de 50MB
        validateStatus: (status) => status >= 200 && status < 300,
      });

      console.log(`Descarga exitosa. Tamaño: ${response.data?.length || 'desconocido'} bytes`);

      // Obtener el nombre del archivo de la URL o de los encabezados
      let filename = '';
      const contentDisposition = response.headers['content-disposition'];

      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      // Si no se encontró en los encabezados, extraer de la URL
      if (!filename) {
        const urlWithoutQuery = url.split('?')[0]; // Eliminar parámetros de consulta
        const urlParts = urlWithoutQuery.split('/');
        filename = urlParts[urlParts.length - 1] || 'archivo_descargado';
      }

      console.log(`Nombre del archivo: ${filename}`);

      // Crear buffer a partir de los datos de respuesta
      let buffer: Buffer;
      if (Buffer.isBuffer(response.data)) {
        buffer = response.data;
      } else if (response.data && response.data.buffer && Buffer.isBuffer(response.data.buffer)) {
        buffer = response.data.buffer;
      } else {
        buffer = Buffer.from(response.data);
      }

      if (!buffer || buffer.length === 0) {
        throw new Error('La respuesta no contiene datos válidos');
      }

      return { buffer, filename };
    } catch (error) {
      console.error(`Error al descargar archivo desde URL: ${url}`, error.message);
      throw new NotFoundException(
        sendResponse(context, this.I18N_SPACE, 'getFileFromUrl.fileNotFound', {
          url,
          message: error?.message || 'Error desconocido al descargar el archivo',
        }),
      );
    }
  }

  async create(context: IContext, createFileInput: CreateFileInput): Promise<FileInfo> {
    const file = {} as FileInfo;
    let buffer: Buffer;

    if (createFileInput.fileMongoId) buffer = await this.filesManagerService.downloadFileAndConvertToBuffer(createFileInput.fileMongoId);
    else buffer = Buffer.from(createFileInput.fileBuffer);

    const mongoData = await this.filesManagerService.parseFileName(buffer, createFileInput.fileName);
    // Si se proporcionó una extensión específica, usarla en lugar de la detectada
    file.fileExtension = createFileInput.fileExtension || mongoData.fileExtension;
    file.fileMode = process.env.DB_FILE_MODE as FileModes;
    file.fileName = mongoData.fileName;
    file.fileMongoId = createFileInput.fileMongoId;
    file.fileBuffer = createFileInput.fileBuffer ? Buffer.from(createFileInput.fileBuffer, 'base64') : null;

    const repository = this.getRepository(context);

    const result = await repository.save(file);
    delete result.fileBuffer;
    return result;
  }

  async createFileBase64(context: IContext, body: CreateFileBase64Input) {
    // Validación de base64
    const isValidBase64 = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(body.content);

    if (!isValidBase64) {
      throw new BadRequestException('El contenido debe estar en un formato base64 válido');
    }

    const buffer = Buffer.from(body.content, 'base64');
    const fileName = body.filename;
    return await this.uploadBuffer(context, buffer, fileName);
  }

  async findBuffer(context: IContext, id: string, orFail?: boolean): Promise<{ buffer: Buffer; extension: string }> {
    try {
      const entity = await this.findOneBy(context, {
        where: { id },
        select: ['fileBuffer', 'fileExtension', 'fileMode', 'fileMongoId', 'fileName'],
      });

      if (entity.fileBuffer) {
        return { buffer: entity.fileBuffer, extension: entity.fileExtension };
      } else if (entity.fileMongoId) {
        const buffer = await this.filesManagerService.downloadFileAndConvertToBuffer(entity.fileMongoId, orFail);
        return { buffer, extension: entity.fileExtension };
      } else {
        throw new BadRequestException('Buffer not found for entity with ID ' + id);
      }
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async download(context: IContext, id: string, res: Response): Promise<void> {
    const repository = this.getRepository(context);
    const entity = await repository.findOne({
      where: { id },
      select: ['fileBuffer', 'fileExtension', 'fileMode', 'fileMongoId', 'fileName'],
    });

    if (!entity) {
      throw new InternalServerErrorException('File not found');
    }

    res.header('Content-Type', await getMimeTypeFromExtension(entity.fileExtension));
    res.header('Content-Disposition', `attachment; filename=${entity.fileName}.${entity.fileExtension}`);

    switch (entity.fileMode) {
      case FileModes.mongo:
        const fileStream = await this.filesManagerService.readStream(entity.fileMongoId?.trim());
        if (!fileStream) {
          throw new InternalServerErrorException('File not found');
        }

        fileStream.once('error', (error) => {
          throw new InternalServerErrorException('File can´t read, ' + error);
        });

        fileStream.pipe(res);
        break;
      case FileModes.buffer:
        res.send(entity.fileBuffer);
        break;
      case FileModes.url:
        break;
      default:
        throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'modeNotFound'));
    }
  }

  async uploadBuffer(context: IContext, buffer: Buffer, fileName: string) {
    try {
      console.log(`Procesando archivo: ${fileName}, tamaño: ${buffer.length} bytes`);

      let fileId = undefined;
      let fileBuffer = undefined;
      let fileExtension = 'unknown';

      // Extraer extensión del nombre del archivo (última parte después del último punto)
      const lastDotIndex = fileName.lastIndexOf('.');
      const extensionFromName = lastDotIndex > -1 ? fileName.substring(lastDotIndex + 1).toLowerCase() : '';

      console.log(`Extensión extraída del nombre: "${extensionFromName}"`);

      // PRIORIDAD 1: Si el nombre termina en .xlsx, .xls, usar eso SIEMPRE
      if (extensionFromName === 'xlsx' || extensionFromName === 'xls') {
        fileExtension = extensionFromName;
        console.log(`✓ Usando .${fileExtension} del nombre del archivo (PRIORIDAD)`);
      } 
      // PRIORIDAD 2: Otros formatos conocidos del nombre
      else if (['csv', 'pdf', 'doc', 'docx', 'txt', 'json', 'zip'].includes(extensionFromName)) {
        fileExtension = extensionFromName;
        console.log(`✓ Usando .${fileExtension} del nombre del archivo`);
      } 
      // PRIORIDAD 3: Detectar desde buffer
      else {
        try {
          const fileType = await fromBuffer(buffer);
          if (fileType && fileType.ext) {
            fileExtension = fileType.ext;
            console.log(`✓ Detectado del buffer: .${fileExtension} (MIME: ${fileType.mime})`);
          } else if (extensionFromName) {
            fileExtension = extensionFromName;
            console.log(`✓ Buffer sin tipo, usando nombre: .${fileExtension}`);
          } else {
            fileExtension = 'pdf';
            console.log(`✓ No se detectó extensión, usando default: .pdf`);
          }
        } catch (error) {
          console.error(`Error al detectar tipo de archivo:`, error.message);
          fileExtension = extensionFromName || 'pdf';
          console.log(`✓ Error en detección, usando fallback: .${fileExtension}`);
        }
      }

      console.log(`EXTENSIÓN FINAL: .${fileExtension}`);

      // Procesar según el modo de almacenamiento
      switch (process.env.DB_FILE_MODE) {
        case FileModes.mongo:
          fileId = await this.uploadService.savePdfToGridFS(buffer, fileName);
          break;
        case FileModes.buffer:
          fileBuffer = buffer;
          break;
        case FileModes.url:
          return;
          break;
        default:
          throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'modeNotFound'));
      }

      // Nombre del archivo sin extensión para agregar la extensión detectada
      let baseFileName = fileName;
      if (fileName.includes('.')) {
        baseFileName = fileName.substring(0, fileName.lastIndexOf('.'));
      }

      const createFileInput: CreateFileInput = {
        fileMongoId: fileId,
        fileName: baseFileName,
        fileBuffer,
        fileExtension,
      };

      console.log(`Guardando archivo con nombre: ${baseFileName}.${fileExtension}`);
      const result = await this.create(context, createFileInput);
      return result;
    } catch (error) {
      console.error(`Error en uploadBuffer:`, error);
      throw new BadRequestException(`Error al procesar el archivo: ${error.message}`);
    }
  }

  // async saveToTempFolder(context: IContext, id: string): Promise<string> {
  //   const { buffer, extension } = await this.findBuffer(context, id);

  //   const tempFolderPath = path.join(process.cwd(), 'dist', 'general', 'temp').replace(/\\/g, '/');
  //   const filePath = path.join(tempFolderPath, `${id}.${extension}`);

  //   if (!fs.existsSync(tempFolderPath)) {
  //     fs.mkdirSync(tempFolderPath);
  //   }

  //   fs.writeFileSync(filePath, buffer);

  //   const downloadUrl = `/${id}.${extension}`;
  //   return process.env.DIGISIGN_URL + downloadUrl;
  // }

  async saveToTempFolder(
    context: IContext,
    id?: string,
    orFail?: boolean,
    usefulBuffer?: Buffer,
    customName?: string,
    customExtension?: string,
  ): Promise<string | undefined> {
    const tempFolderPath = path.join(process.cwd(), 'dist', 'general', 'temp').replace(/\\/g, '/');

    let filePath;

    let buffer;

    let extension;

    let name;

    if (id) {
      const data = await this.findBuffer(context, id, orFail);

      const { buffer: bff, extension: xt } = data;

      name = id;

      buffer = bff;

      extension = xt;

      filePath = path.join(tempFolderPath, `${name}.${extension}`);
    }

    if (usefulBuffer) {
      name = customName;

      buffer = Buffer.isBuffer(usefulBuffer) ? usefulBuffer : Buffer.from(usefulBuffer);

      extension = customExtension;

      filePath = path.join(tempFolderPath, `${customName}.${customExtension}`);
    }

    if (!fs.existsSync(tempFolderPath)) {
      fs.mkdirSync(tempFolderPath);
    }

    if (!buffer) return;

    fs.writeFileSync(filePath, buffer);

    const downloadUrl = `${STATIC_FILES_ROUTE}/${name}.${extension}`;
    return downloadUrl;
  }

  async static(context: IContext, id: string, ext: string, res: Response) {
    const fileName = `${id}.${ext}`;
    const filePath = path.join(process.cwd(), 'dist', 'general', 'temp', fileName).replace(/\\/g, '/');

    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true }); // Crea todos los directorios necesarios
    }

    if (!fs.existsSync(filePath)) {
      const fileRecord = await this.findOneBy(context, {
        where: { id, fileExtension: String(ext || "").trim() },
      });

      if (!fileRecord) {
        throw new BadRequestException('Archivo no encontrado en la base de datos');
      }

      const buffer = await this.findBuffer(context, id, true);
      if (!(buffer?.buffer instanceof Buffer)) {
        throw new BadRequestException('Ha habido un problema al retornar la data del documento');
      }

      fs.writeFileSync(filePath, buffer.buffer);
    }

    res.sendFile(filePath);
  }

  async smartDownloadFromUrl(context: IContext, fileUrl: string): Promise<FileInfo | null> {
    try {
      const defaultHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8,application/pdf;q=0.9,application/octet-stream;q=0.8',
        'Cache-Control': 'no-cache',
        'ign-auth-check': '1',
      };

      return await this.createFileByUrl(context, fileUrl, defaultHeaders);
    } catch (error) {
      return null; // Retorna null si hay algún error al descargar o crear el archivo para no frenar el proceso
    }
  }
}
