const fs = require('fs');
const path = require('path');
const util = require('util');

// Función para encontrar archivos recursivamente
function findFiles(dir, pattern) {
  let results = [];
  
  try {
    const list = fs.readdirSync(dir);
    
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Si es un directorio, buscar recursivamente
        results = results.concat(findFiles(filePath, pattern));
      } else if (pattern.test(file)) {
        // Si coincide con el patrón, agregar a resultados
        results.push(filePath);
      }
    }
  } catch (err) {
    console.error(`Error al acceder a ${dir}:`, err.message);
  }
  
  return results;
}

// Función para extraer el contenido del decorador @ViewEntity
function extractViewEntityDecorator(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar el decorador @ViewEntity con una expresión regular simple
    const match = content.match(/@ViewEntity\s*\(([^)]+)\)/);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return null;
  } catch (err) {
    console.error(`Error al leer ${filePath}:`, err.message);
    return null;
  }
}

// Función para parsear el objeto literal TypeScript a un objeto JavaScript
function parseObjectLiteral(objectLiteral) {
  const parsedObject = {};
  
  // Extraer el nombre
  const nameMatch = objectLiteral.match(/name\s*:\s*([^,\n]+)/);
  if (nameMatch && nameMatch[1]) {
    parsedObject.name = nameMatch[1].trim();
  }
  
  // Extraer dependsOn como array
  const dependsOnMatch = objectLiteral.match(/dependsOn\s*:\s*\[(.*?)\]/s);
  if (dependsOnMatch && dependsOnMatch[1]) {
    // Limpiar y convertir en array real
    const dependsOnStr = dependsOnMatch[1].trim();
    if (dependsOnStr) {
      parsedObject.dependsOn = dependsOnStr.split(',').map(item => item.trim());
    } else {
      parsedObject.dependsOn = [];
    }
  }
  
  // Extraer synchronize
  const synchronizeMatch = objectLiteral.match(/synchronize\s*:\s*(true|false)/);
  if (synchronizeMatch && synchronizeMatch[1]) {
    parsedObject.synchronize = synchronizeMatch[1] === 'true';
  }
  
  // Extraer expression
  const expressionMatch = objectLiteral.match(/expression\s*:\s*(`|"|')([^]*?)(\1)/);
  if (expressionMatch && expressionMatch[2]) {
    parsedObject.expression = expressionMatch[2].trim();
  }
  
  return parsedObject;
}

// Función para buscar y extraer el objeto completo del query
function findQueryObject(viewEntityName, queryFiles) {
  for (const queryFile of queryFiles) {
    try {
      const content = fs.readFileSync(queryFile, 'utf8');
      
      // Verificar si este archivo contiene la exportación del viewEntity
      if (content.includes(`export default ${viewEntityName}`)) {
        // Extraer el objeto completo usando una expresión regular más compleja
        // Busca la declaración de variable completa
        const objectMatch = content.match(new RegExp(`const\\s+${viewEntityName}\\s*:\\s*\\w+\\s*=\\s*({[\\s\\S]*?});`, 'm'));
        
        if (objectMatch && objectMatch[1]) {
          const objectLiteral = objectMatch[1].trim();
          // Parsear el objeto literal
          const parsedObject = parseObjectLiteral(objectLiteral);
          
          return {
            objectContent: objectLiteral,
            parsedObject: parsedObject,
            filePath: queryFile
          };
        }
      }
    } catch (err) {
      console.error(`Error al leer ${queryFile}:`, err.message);
    }
  }
  
  return null;
}

// Función principal
function main() {
  console.log('Buscando archivos view.entity.ts...');
  
  // Buscar en el directorio src
  const srcDir = path.join(process.cwd(), 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error('El directorio src no existe');
    return;
  }
  
  // Encontrar todos los archivos view.entity.ts
  const viewEntityFiles = findFiles(srcDir, /view\.entity\.ts$/);
  console.log(`Encontrados ${viewEntityFiles.length} archivos view.entity.ts`);
  
  // Encontrar todos los archivos de consulta view.query.ts
  const queryFiles = findFiles(srcDir, /\.view\.query\.ts$/);
  console.log(`Encontrados ${queryFiles.length} archivos view.query.ts`);
  
  // Procesar cada archivo de entidad
  for (const file of viewEntityFiles) {
    const fileName = path.basename(file);
    console.log(`\n========== ${fileName} ==========`);
    
    // Extraer el nombre del view entity
    const viewEntityName = extractViewEntityDecorator(file);
    console.log(`ViewEntity: ${viewEntityName || 'No encontrado'}`);
    
    if (viewEntityName) {
      // Buscar el objeto completo
      const queryResult = findQueryObject(viewEntityName, queryFiles);
      
      if (queryResult) {
        // Mostrar el objeto parseado
        console.log('\nObjeto parseado:');
        console.log(util.inspect(queryResult.parsedObject, { depth: null, colors: true }));
        
        console.log(`\nArchivo de definición: ${queryResult.filePath}`);
      } else {
        console.log('No se pudo encontrar el objeto completo asociado.');
      }
    }
  }
}

// Permitir la ejecución desde línea de comandos o como módulo
if (require.main === module) {
  main();
}

module.exports = { main }; 