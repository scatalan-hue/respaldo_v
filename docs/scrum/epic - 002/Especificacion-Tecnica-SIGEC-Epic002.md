# Especificación Técnica de Integración SIGEC - Epic 002

## Resumen de Documentación Oficial

Basado en la documentación oficial del webservice SIGEC (Manual de Usuario Administrador - Fase I Interoperabilidad), esta especificación detalla los campos exactos y códigos requeridos para la integración de VUDEC con SIGEC para los procesos de adición y cesión contractual.

## Campos Obligatorios Según Documentación Oficial

### 📋 Estructura Base del Payload SIGEC

```typescript
interface SigecBasePayload {
  // Código del hecho generador - OBLIGATORIO
  factCodeGenerator: string;            // Valores: SECOP I, SECOP II, TVEC
  
  // Valor en pesos del hecho generador - OBLIGATORIO  
  generatorFactValue: number;           // Valor numérico sin decimales
  
  // Fechas del hecho generador - OBLIGATORIAS
  generatorFactStartDate: string;       // Formato: YYYY-MM-DD
  generatorFactEndDate: string;         // Formato: YYYY-MM-DD
  
  // Tipo de documento del acto - OBLIGATORIO
  parametricActDocumentCodeType: string; // "AD4" para contratos según documentación
  
  // Información del contratista - OBLIGATORIOS
  payerDocumentParametricTypeCode: string; // Tipo de identificación
  taxpayerDocumentNumber: string;       // Número de identificación  
  taxpayerName: string;                 // Nombres y apellidos o Razón social
}
```

### 🔧 Campo Clave: parametricprocedureCode

Según la documentación oficial, este campo es **OBLIGATORIO** y debe estar dentro de los valores permitidos:

```typescript
enum SigecProcedureCode {
  SUSCRIPCION = "TR1",    // Suscripción
  ADICION = "TR2",        // Adición ✅ (Para HU005)
  PRORROGA = "TR3",       // Prórroga  
  SESION = "TR4",         // Sesión ✅ (Para HU006)
  NO_APLICA = "TR5"       // No Aplica
}
```

## Implementación Específica por Historia de Usuario

### 🟦 HU005 - Proceso de Otro Sí Contractual

#### Payload SIGEC para Adiciones (Caso de Uso 7)
```typescript
interface SigecAdditionPayload extends SigecBasePayload {
  // Campo específico para adiciones - VALOR FIJO
  parametricprocedureCode: "TR2";       // "TR2" - Adición (según documentación)
  
  // El generatorFactValue debe ser el NUEVO valor total del contrato
  // (valor original + valor de la adición)
  generatorFactValue: number;           // Valor total actualizado del contrato
}
```

#### Ejemplo de Implementación
```typescript
// Servicio para crear payload de adición
class SigecAdditionService {
  static createAdditionPayload(
    contract: Contract, 
    addition: ContractAddition,
    taxpayer: Taxpayer
  ): SigecAdditionPayload {
    return {
      factCodeGenerator: contract.platform,          // SECOP I/II/TVEC
      generatorFactValue: contract.value + addition.value, // Valor total nuevo
      generatorFactStartDate: contract.startDate.toISOString().split('T')[0],
      generatorFactEndDate: contract.endDate.toISOString().split('T')[0],
      parametricActDocumentCodeType: "AD4",          // Fijo para contratos
      parametricprocedureCode: "TR2",                // Fijo para adiciones
      payerDocumentParametricTypeCode: taxpayer.documentType,
      taxpayerDocumentNumber: taxpayer.documentNumber,
      taxpayerName: taxpayer.name
    };
  }
}
```

### 🟦 HU006 - Proceso de Cesión Contractual

#### Payload SIGEC para Cesiones (Caso de Uso 8)
```typescript
interface SigecCessionPayload extends SigecBasePayload {
  // Campo específico para cesiones - VALOR FIJO
  parametricprocedureCode: "TR4";       // "TR4" - Sesión (según documentación)
  
  // Los datos del taxpayer deben ser del NUEVO titular (cesionario)
  payerDocumentParametricTypeCode: string; // Tipo del cesionario
  taxpayerDocumentNumber: string;       // Documento del cesionario
  taxpayerName: string;                 // Nombre del cesionario
}
```

#### Ejemplo de Implementación
```typescript
// Servicio para crear payload de cesión
class SigecCessionService {
  static createCessionPayload(
    contract: Contract,
    cession: ContractCession,
    newTaxpayer: Taxpayer
  ): SigecCessionPayload {
    return {
      factCodeGenerator: contract.platform,          // SECOP I/II/TVEC
      generatorFactValue: contract.value,            // Valor del contrato
      generatorFactStartDate: contract.startDate.toISOString().split('T')[0],
      generatorFactEndDate: contract.endDate.toISOString().split('T')[0],
      parametricActDocumentCodeType: "AD4",          // Fijo para contratos
      parametricprocedureCode: "TR4",                // Fijo para cesiones
      payerDocumentParametricTypeCode: newTaxpayer.documentType,
      taxpayerDocumentNumber: newTaxpayer.documentNumber,
      taxpayerName: newTaxpayer.name
    };
  }
}
```

## Validaciones Obligatorias

### 🔍 Validador de Campos SIGEC
```typescript
class SigecPayloadValidator {
  static validateBasePayload(payload: SigecBasePayload): ValidationResult {
    const errors: string[] = [];
    
    // Validar factCodeGenerator
    const validFactCodes = ['SECOP I', 'SECOP II', 'TVEC'];
    if (!validFactCodes.includes(payload.factCodeGenerator)) {
      errors.push(`Invalid factCodeGenerator. Must be one of: ${validFactCodes.join(', ')}`);
    }
    
    // Validar generatorFactValue
    if (!payload.generatorFactValue || payload.generatorFactValue <= 0) {
      errors.push('generatorFactValue must be a positive number');
    }
    
    // Validar fechas (formato YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(payload.generatorFactStartDate)) {
      errors.push('generatorFactStartDate must be in YYYY-MM-DD format');
    }
    if (!dateRegex.test(payload.generatorFactEndDate)) {
      errors.push('generatorFactEndDate must be in YYYY-MM-DD format');
    }
    
    // Validar parametricActDocumentCodeType
    if (payload.parametricActDocumentCodeType !== 'AD4') {
      errors.push('parametricActDocumentCodeType must be "AD4" for contracts');
    }
    
    // Validar información del taxpayer
    if (!payload.taxpayerDocumentNumber?.trim()) {
      errors.push('taxpayerDocumentNumber is required');
    }
    if (!payload.taxpayerName?.trim()) {
      errors.push('taxpayerName is required');
    }
    
    return { isValid: errors.length === 0, errors };
  }
  
  static validateProcedureCode(code: string, expectedCode: 'TR2' | 'TR4'): boolean {
    return code === expectedCode;
  }
}
```

## Configuración de Variables de Entorno

### Variables Específicas para SIGEC
```env
# Códigos fijos según documentación oficial SIGEC
SIGEC_PARAMETRIC_ACT_DOCUMENT_CODE_TYPE="AD4"
SIGEC_PARAMETRIC_PROCEDURE_CODE_ADDITION="TR2"
SIGEC_PARAMETRIC_PROCEDURE_CODE_CESSION="TR4"

# Validación de códigos de plataforma permitidos
SIGEC_VALID_FACT_CODE_GENERATORS="SECOP I,SECOP II,TVEC"

# Configuración de timeouts
SIGEC_CASE_7_TIMEOUT=30000
SIGEC_CASE_8_TIMEOUT=30000

# Habilitación de casos de uso
SIGEC_CASE_7_ENABLED=true
SIGEC_CASE_8_ENABLED=true
```

## Manejo de Errores Específicos de SIGEC

### Errores de Validación de Documentación
```typescript
enum SigecValidationError {
  INVALID_PROCEDURE_CODE = 'INVALID_PROCEDURE_CODE',
  INVALID_FACT_CODE_GENERATOR = 'INVALID_FACT_CODE_GENERATOR', 
  INVALID_DATE_FORMAT = 'INVALID_DATE_FORMAT',
  INVALID_DOCUMENT_TYPE = 'INVALID_DOCUMENT_TYPE',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD'
}

interface SigecError {
  code: SigecValidationError;
  message: string;
  field: string;
  expectedValue?: string;
  actualValue?: string;
}
```

### Respuestas de Error de SIGEC
Según la documentación, si el campo `parametricprocedureCode` no es válido:

```
"Error. El parámetro parametricprocedureCode es obligatorio y debe estar dentro de los códigos válidos"
```

## Testing de Integración

### Casos de Prueba Obligatorios
```typescript
describe('SIGEC Integration - Official Documentation Compliance', () => {
  describe('HU005 - Contract Additions', () => {
    it('should use TR2 code for additions', () => {
      const payload = SigecAdditionService.createAdditionPayload(contract, addition, taxpayer);
      expect(payload.parametricprocedureCode).toBe('TR2');
    });
    
    it('should use AD4 for contract document type', () => {
      const payload = SigecAdditionService.createAdditionPayload(contract, addition, taxpayer);
      expect(payload.parametricActDocumentCodeType).toBe('AD4');
    });
  });
  
  describe('HU006 - Contract Cessions', () => {
    it('should use TR4 code for cessions', () => {
      const payload = SigecCessionService.createCessionPayload(contract, cession, newTaxpayer);
      expect(payload.parametricprocedureCode).toBe('TR4');
    });
    
    it('should use new taxpayer data for cessions', () => {
      const payload = SigecCessionService.createCessionPayload(contract, cession, newTaxpayer);
      expect(payload.taxpayerDocumentNumber).toBe(newTaxpayer.documentNumber);
      expect(payload.taxpayerName).toBe(newTaxpayer.name);
    });
  });
});
```

## Monitoreo y Métricas

### Métricas Específicas de Cumplimiento
- **Tasa de éxito por código de procedimiento** (TR2 vs TR4)
- **Errores de validación por campo** según documentación oficial
- **Tiempo de respuesta por caso de uso** (7 vs 8)
- **Volumen de transacciones por tipo** (adiciones vs cesiones)

### Alertas de Cumplimiento
- **Código de procedimiento inválido** - Alerta crítica
- **Formato de fecha incorrecto** - Alerta alta
- **Campos obligatorios faltantes** - Alerta crítica
- **Tipo de documento incorrecto** - Alerta media

---

**Fecha de Creación**: Octubre 2025  
**Basado en**: Manual de Usuario Administrador SIGEC - Fase I Interoperabilidad  
**Código**: CCE-GTI-MA-01  
**Versión**: 01 del 10 de octubre de 2023  
**Estado**: ✅ Validado con documentación oficial

## Referencias

- [📋 Epic 002 - Adecuaciones CU SIIAFE](./Epic%20002%20-%20Adecuaciones%20CU%20SIIAFE.md)
- [🔗 HU005 - Proceso de otro sí contractual](./HU005%20-%20Proceso%20de%20otro%20si%20contractual.md)  
- [🔗 HU006 - Proceso de cesión contractual](./HU006%20-%20Proceso%20de%20cesion%20contractual.md)
- [📖 Manual SIGEC - Interoperabilidad](https://www.colombiacompra.gov.co)