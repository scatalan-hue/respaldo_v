[Home](../../../../README.md) > [General Module Documentation](../../docs/general.md) > [Base Module Documentation]

# **Module: Base**

## **Description**

El módulo Base es un componente fundamental del sistema VUDEC que proporciona servicios básicos y utilidades que son utilizados a lo largo de toda la aplicación. Este módulo está diseñado como un módulo global, lo que significa que sus servicios están disponibles para ser utilizados en cualquier parte de la aplicación sin necesidad de importarlo explícitamente en cada módulo que lo requiera.

## **Features**

### **Servicios Básicos**
* Proporcionar acceso centralizado a la URL base de la aplicación
* Facilitar la configuración de URLs para endpoints y servicios
* Integrar con el sistema de configuración de la aplicación

## **Services**

### **BaseService**
Ubicado en `services/base.service.ts`

#### Descripción
Servicio que proporciona utilidades básicas para toda la aplicación, como la obtención de la URL base del sistema utilizando las variables de configuración.

#### Métodos Principales

##### getBaseUrl
```typescript
getBaseUrl(): string
```
- **Descripción:** Obtiene la URL base de la aplicación utilizando la configuración del sistema.
- **Retorna:** `string` - La URL base completa incluyendo protocolo, host y puerto.
- **Implementación:**
  ```typescript
  getBaseUrl(): string {
    const port = this.configService.get<number>('APP_PORT') || 3000;
    const baseUrl = `${this.configService.get<string>('APP_URL') || 'http://localhost'}:${port}`;
    return baseUrl;
  }
  ```
- **Uso:** Este método es utilizado por otros servicios para construir URLs completas para endpoints y recursos.

## **Module**

### **BaseModule**
Ubicado en `base.module.ts`

#### Descripción
Módulo que encapsula y proporciona el servicio BaseService, marcado como global para que esté disponible en toda la aplicación.

#### Decoradores
- **@Global()**: Marca el módulo como global, lo que significa que una vez importado en el módulo raíz, sus proveedores están disponibles para todos los módulos sin necesidad de importarlo explícitamente.

#### Proveedores
- **BaseService**: Servicio principal del módulo que proporciona utilidades básicas.

#### Exportaciones
- **BaseService**: Exportado para que esté disponible para otros módulos.

#### Implementación
```typescript
@Global()
@Module({
  imports: [],
  providers: [BaseService],
  exports: [BaseService],
})
export class BaseModule {}
```

## **Dependencias**

### **Módulos Externos**
- **ConfigService (@nestjs/config)**: Utilizado para acceder a las variables de configuración del sistema.

## **Uso del Módulo**

### **Ejemplo de Uso en Otros Servicios**
```typescript
@Injectable()
export class MiServicio {
  constructor(private readonly baseService: BaseService) {}

  generarUrlCompleta(endpoint: string): string {
    const baseUrl = this.baseService.getBaseUrl();
    return `${baseUrl}/${endpoint}`;
  }
}
```

## **Variables de Configuración**

### **Variables Utilizadas**
| Variable | Tipo | Descripción | Valor por Defecto |
|----------|------|-------------|------------------|
| APP_URL | string | URL base de la aplicación | http://localhost |
| APP_PORT | number | Puerto en el que corre la aplicación | 3000 |

## **Consideraciones Importantes**

- El módulo Base está marcado como **@Global()**, lo que significa que solo debe ser importado en el módulo raíz de la aplicación (AppModule).
- El BaseService proporciona una forma centralizada de acceder a la URL base de la aplicación, lo que garantiza consistencia en la construcción de URLs en toda la aplicación. 