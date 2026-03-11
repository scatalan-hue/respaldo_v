import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config(); // Cargar variables de entorno desde el archivo .env

const configService = new ConfigService();

export default new DataSource({
  migrationsTableName: 'migrations',
  type: 'mssql',
  host: configService.get<string>('DB_HOST'),
  port: parseInt(configService.get<string>('DB_PORT'), 10),
  username: configService.get<string>('DB_USERNAME'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_NAME'),
  logging: true,
  schema: 'dbo',
  logger: 'simple-console',
  synchronize: false,
  cache: true,
  name: 'default',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/**/*{.ts,.js}'],
  subscribers: ['src/**/subscriber/*.subscriber{.ts,.js}'],
  options: {
    encrypt: false,
  },
});
