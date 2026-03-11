import { Injectable } from '@nestjs/common';
import { GridFSBucket, MongoClient } from 'mongodb';

@Injectable()
export class UploadService {
  private gridFSBucket: GridFSBucket;

  constructor() {
    this.initializeGridFS();
  }

  private async initializeGridFS() {
    const client = new MongoClient(process.env.DB_MONGODB_SERVER);
    await client.connect();
    const db = client.db(process.env.DB_MONGODB_NAME);
    this.gridFSBucket = new GridFSBucket(db);
  }

  async savePdfToGridFS(buffer: Buffer, filename: string): Promise<string> {
    const uploadStream = this.gridFSBucket.openUploadStream(filename);
    uploadStream.write(buffer);
    uploadStream.end();

    return new Promise((resolve, reject) => {
      uploadStream.on('finish', () => {
        resolve(uploadStream.id.toString());
      });
      uploadStream.on('error', (error) => {
        reject(error);
      });
    });
  }
}
