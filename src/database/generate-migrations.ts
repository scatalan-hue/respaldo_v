// import { glob } from 'fast-glob';
// import * as fs from 'fs';
// import { sortViews } from '../common/functions/sort-views';

// const generateMigration = async () => {
//   const files = await glob('src/**/*.view.query.ts', { absolute: true });

//   const allQueries = [];

//   // Cargar los módulos de las vistas
//   for (const file of files) {
//     try {
//       const module = await import(file);

//       if (module.default) {
//         allQueries.push(module.default);
//       } else {
//         console.warn(`El archivo ${file} no exporta un objeto válido.`);
//       }
//     } catch (error) {
//       console.error(`Error al importar el archivo ${file}:`, error);
//     }
//   }

//   const sortedViews = sortViews(allQueries);
//   const totalViews = sortedViews.length;

//   const dateNow = Date.now();
//   const migrationPath = `./src/database/migrations/${dateNow}-migration.ts`;

//   let upQueries = '';
//   let downQueries = '';

//   // Procesar vistas una por una y mostrar el progreso en tiempo real
//   for (let index = 0; index < sortedViews.length; index++) {
//     const viewName = sortedViews[index];
//     const view = allQueries.find((v) => v.name === viewName);
//     if (!view || !viewName || !view?.expression) continue;

//     // Mostrar el nombre de la vista y el porcentaje de progreso
//     // const percentage = ((index + 1) / totalViews) * 100;
//     // console.log(`Sincronizando vista: "${viewName}" - Progreso: ${percentage.toFixed(2)}%`);
//     console.log(`Vista sincronizada: "${viewName}"`);

//     upQueries += `    await queryRunner.query(\`CREATE VIEW "dbo"."${viewName}" AS ${view.expression}\`);\n`;
//     downQueries += `    await queryRunner.query(\`DROP VIEW IF EXISTS "${viewName}";\`);\n`;
//   }

//   // Una vez procesadas todas las vistas, generar la migración
//   const migrationTemplate = `
// import { MigrationInterface, QueryRunner } from 'typeorm';

// export class Migration${dateNow} implements MigrationInterface {
// public async up(queryRunner: QueryRunner): Promise<void> {
// ${downQueries}
// ${upQueries}
// }

// public async down(queryRunner: QueryRunner): Promise<void> {
// ${downQueries}
// }
// }
// `;

//   fs.writeFileSync(migrationPath, migrationTemplate, 'utf8');
//   console.log(`\nMigration generated: ${migrationPath}`);
// };

// generateMigration().catch((err) => {
//   console.error('Error generating migration:', err);
// });
import { glob } from 'fast-glob';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { sortViews } from '../common/functions/sort-views';
import { config } from 'dotenv';
import { ConfigService } from '@nestjs/config';

config(); // Cargar variables de entorno desde .env

const configService = new ConfigService();

export const generateMigration = async () => {
  console.log('🔄 Generando migración de vistas...');

  const files = await glob('src/**/*.view.query.ts', { absolute: true });
  const allQueries = [];

  // Cargar los módulos de las vistas
  for (const file of files) {
    try {
      const module = await import(file);
      if (module.default) {
        allQueries.push(module.default);
      } else {
        console.warn(`⚠️ El archivo ${file} no exporta un objeto válido.`);
      }
    } catch (error) {
      console.error(`❌ Error al importar el archivo ${file}:`, error);
    }
  }

  // Ordenar las vistas correctamente
  const sortedViews = sortViews(allQueries);
  const totalViews = sortedViews.length;

  if (totalViews === 0) {
    console.log('✅ No se encontraron vistas para migrar.');
    return;
  }

  // Buscar si ya existe una migración con el mismo nombre
  const migrationFiles = await glob('src/database/migrations/*-create-views.ts', { absolute: true });

  // if (configService.get<string>("STATE") === "prod") {
  //   if (migrationFiles.length > 0) {
  //     console.log("✅ Ya existe una migración para las vistas. No se generará una nueva.");
  //     return;
  //   }
  // } else {
  // Si no es producción y ya existe una migración, eliminarla
  if (migrationFiles.length > 0) {
    for (const file of migrationFiles) {
      fs.unlinkSync(file);
    }
  }
  // }

  // Generar una nueva migración con TypeORM
  execSync('typeorm migration:create src/database/migrations/create-views');

  // Buscar el archivo recién creado
  const newMigrationFiles = await glob('src/database/migrations/*-create-views.ts', { absolute: true });

  if (newMigrationFiles.length === 0) {
    console.error('❌ No se encontró el archivo de migración generado.');
    return;
  }

  const migrationPath = newMigrationFiles[0];

  let upQueries = '';
  let downQueries = '';

  // Procesar vistas en orden y generar los queries
  for (const viewName of sortedViews) {
    const view = allQueries.find((v) => v.name === viewName);
    if (!view || !viewName || !view?.expression) continue;

    console.log(`✅ Vista sincronizada: "${viewName}"`);

    upQueries += `        await queryRunner.query(\`CREATE VIEW "dbo"."${viewName}" AS ${view.expression}\`);\n`;
    downQueries += `        await queryRunner.query(\`DROP VIEW IF EXISTS "${viewName}";\`);\n`;
  }

  // Leer el archivo de migración generado
  let migrationContent = fs.readFileSync(migrationPath, 'utf8');

  // Reemplazar el contenido de up() y down()
  migrationContent = migrationContent.replace(
    'public async up(queryRunner: QueryRunner): Promise<void> {',
    `public async up(queryRunner: QueryRunner): Promise<void> {\n${downQueries} \n${upQueries}`,
  );

  migrationContent = migrationContent.replace(
    'public async down(queryRunner: QueryRunner): Promise<void> {',
    `public async down(queryRunner: QueryRunner): Promise<void> {\n${downQueries}`,
  );

  // Guardar la migración actualizada
  fs.writeFileSync(migrationPath, migrationContent, 'utf8');

  execSync('npm run typeorm:run', { stdio: 'inherit' });

  console.log(`✅ Migración actualizada en: ${migrationPath}`);
};

if (require.main === module) {
  generateMigration().catch((err) => {
    console.error('❌ Error generando la migración:', err);
  });
}
