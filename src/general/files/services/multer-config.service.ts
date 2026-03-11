import { Injectable, Logger } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import { GridFsStorage } from 'multer-gridfs-storage/lib/gridfs';
import { FileModes } from '../enums/file-modes.enum';

@Injectable()
export class GridFsMulterConfigService implements MulterOptionsFactory {
  private readonly logger = new Logger(GridFsMulterConfigService.name);

  constructor() {}

  createMulterOptions(): MulterModuleOptions {
    const fileMode = process.env.DB_FILE_MODE?.toUpperCase();
    
    switch (fileMode) {
      case FileModes.mongo: {
        const mongoUrl = process.env.DB_MONGODB_SERVER + '/' + process.env.DB_MONGODB_NAME;
        try {
          const storage = new GridFsStorage({
            url: mongoUrl,
            file: (req, file) => {
              return new Promise((resolve) => {
                const filename = String(file.originalname || "").trim();
                const fileInfo = {
                  filename: filename,
                };
                resolve(fileInfo);
              });
            },
          });

          return { storage };
        } catch (e) {
          this.logger.error('Error creating GridFsStorage', e as any);
          return {} as MulterModuleOptions;
        }
      }

      case FileModes.buffer:
        // Almacenamiento en memoria: Multer maneja el buffer internamente
        return {} as MulterModuleOptions;

      case FileModes.url:
        // Implementación específica si se necesita
        return {} as MulterModuleOptions;

      default:
        this.logger.warn(`File mode '${process.env.DB_FILE_MODE}' not recognized. Using default options.`);
        return {} as MulterModuleOptions;
    }
  }
}
