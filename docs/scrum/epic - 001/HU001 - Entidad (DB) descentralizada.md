# HU001 - Entidad (DB) descentralizada

## Descripción de la Historia de Usuario

**Como** administrador del sistema VUDEC  
**Quiero** poder registrar y gestionar entidades descentralizadas en la base de datos utilizando la entidad Organization  
**Para que** el sistema pueda identificar y procesar correctamente las solicitudes provenientes de entidades descentralizadas con la lógica de negocio específica requerida para el reporte al SIGEC

## Contexto y Justificación

Las entidades descentralizadas requieren un manejo diferenciado en VUDEC, ya que:
- Manejan estampillas municipales y departamentales de forma específica
- Necesitan reportar información al SIGEC con lógica particular
- Requieren campos adicionales no presentes en entidades regulares
- Pueden crearse automáticamente por el sistema sin intervención manual
- Inician en estado INCOMPLETE hasta que se configure el token SIGEC
- Deben mantener trazabilidad completa de sus operaciones y cambios de estado

## Decisión Arquitectónica: Utilización de la Entidad Organization

### ✅ Enfoque Seleccionado: Extender la entidad `Organization` existente

La entidad `Organization` es la opción arquitectónicamente correcta para manejar entidades descentralizadas, ya que está específicamente diseñada para este propósito.

### Justificación de la Decisión

#### ✅ Ventajas de utilizar Organization:
1. **Diseño original**: La entidad `Organization` fue concebida para manejar entidades gubernamentales descentralizadas
2. **Campos apropiados**: Ya cuenta con campos específicos como `department`, `city`, `nit`, `address`, `email`, `phone`
3. **Enum OrdenType**: Incluye tipos apropiados (`Department`, `Municipality`, `CentralizeEntity`)
4. **Relaciones establecidas**: Tiene relaciones con `Department`, `City`, y estructura jerárquica con `organizationParent`
5. **Infraestructura existente**: Servicios, resolvers, y módulos ya configurados para este propósito
6. **Arquitectura limpia**: Mantiene separación clara entre entidades de terceros (`Taxpayer`) y organizaciones gubernamentales

#### ✅ Capacidades Actuales de Organization:
- **Gestión jerárquica**: Soporte para organizaciones padre e hijo
- **Ubicación geográfica**: Relación directa con departamentos y municipios
- **Identificación fiscal**: Campo `nit` para número de identificación tributaria
- **Gestión de usuarios**: Relación con usuarios asignados a la organización
- **Gestión de productos**: Relación con productos/servicios de la organización

## Campos Requeridos para Entidades Descentralizadas

Basado en el formulario de registro gubernamental y la estructura actual de la entidad `Organization`:

### Campos Existentes en Organization (Reutilizados)
| Campo | Tipo | Descripción | Mapeo Formulario |
|-------|------|-------------|------------------|
| `name` | string | Nombre de la entidad | NOMBRE DE ENTIDAD |
| `nit` | string | Número de identificación tributaria | NÚMERO DE IDENTIFICACIÓN ENTIDAD |
| `address` | string | Dirección física | DIRECCIÓN DE NOTIFICACIÓN |
| `email` | string | Correo electrónico | CORREO DE CONTACTO |
| `phone` | string | Teléfono de contacto | TELÉFONO DE CONTACTO |
| `department` | Department | Relación con departamento | DEPARTAMENTO |
| `city` | City | Relación con ciudad/municipio | MUNICIPIO |
| `description` | string | Descripción de la entidad | Información adicional |
| `ordenType` | OrdenType | Tipo de orden gubernamental | TIPO ENTIDAD |

### Campos Nuevos a Agregar a Organization
| Campo | Tipo | Descripción | Origen Formulario |
|-------|------|-------------|-------------------|
| `verificationDigit` | string | Dígito de verificación del NIT | DÍGITO DE VERIFICACIÓN |
| `entityType` | string | Tipo específico detallado | TIPO ENTIDAD (detalle) |
| `isRetainerEntity` | boolean | Si es entidad retenedora | ENTIDAD RETENEDORA |
| `sigecToken` | string | Token específico para comunicación con SIGEC (nullable) | Configuración manual |
| `status` | EntityStatus | Estado de la entidad descentralizada | Control interno |
| `createdAutomatically` | boolean | Si fue creada automáticamente por el sistema | Control interno |

### Enum EntityStatus para Entidades Descentralizadas
```typescript
export enum EntityStatus {
  INCOMPLETE = 'INCOMPLETE',     // Sin token SIGEC configurado
  ACTIVE = 'ACTIVE',             // Con token SIGEC y operativa
  SUSPENDED = 'SUSPENDED',       // Temporalmente deshabilitada
  PENDING_VALIDATION = 'PENDING_VALIDATION'  // Esperando validación manual
}
```

### Enum OrdenType Existente (Con Actualización)
El enum `OrdenType` se actualizará para usar el nombre correcto en inglés:

```typescript
export enum OrdenType {
  Department = 'DEPARTMENT',                      // Departamentos
  Municipality = 'MUNICIPALITY',                 // Municipios  
  DecentralizedEntity = 'DECENTRALIZEDENTITY',   // Entidades Descentralizadas ✅
}
```

**Nota**: Las entidades descentralizadas utilizarán el valor `DecentralizedEntity` en el campo `ordenType`.

## Criterios de Aceptación

### ✅ Criterio 1: Extensión de Entidad Organization
- **Dado** que soy un desarrollador
- **Cuando** extiendo la entidad `Organization`
- **Entonces** se agregan los campos específicos para entidades descentralizadas
- **Y** todos los campos nuevos son nullable para mantener compatibilidad
- **Y** se mantiene la funcionalidad existente de organizaciones regulares
- **Y** se extiende el enum `OrdenType` con nuevos tipos de entidades

### ✅ Criterio 2: Identificación de Entidades Descentralizadas
- **Dado** que registro una entidad descentralizada
- **Cuando** configuro el campo `ordenType` como `DecentralizedEntity`
- **Entonces** el sistema aplica validaciones específicas para entidades descentralizadas
- **Y** se requieren los campos adicionales obligatorios
- **Y** se activa la lógica de negocio específica
- **Y** la entidad es reconocida como descentralizada por su tipo de orden

### ✅ Criterio 3: Gestión CRUD Completa
- **Dado** que soy un administrador del sistema
- **Cuando** accedo al módulo de gestión de organizaciones
- **Entonces** puedo crear, consultar, modificar y eliminar entidades descentralizadas
- **Y** la interfaz distingue visualmente entre organizaciones regulares y descentralizadas
- **Y** se aplican validaciones específicas según el tipo
- **Y** se mantiene la estructura jerárquica de organizaciones

### ✅ Criterio 4: Validaciones Específicas
- **Dado** que registro una entidad descentralizada
- **Cuando** completo el formulario
- **Entonces** se validan los campos obligatorios específicos
- **Y** se verifica la unicidad del NIT
- **Y** se valida el formato del dígito de verificación
- **Y** se valida que department y city sean consistentes
- **Y** se mantiene un log de auditoría de cambios

### ✅ Criterio 5: Integración con SIGEC y Estados
- **Dado** que una entidad descentralizada está registrada
- **Cuando** se completa el proceso de registro
- **Entonces** la entidad inicia en estado INCOMPLETE
- **Y** puede funcionar sin token SIGEC configurado
- **Y** cuando se configura el token SIGEC, cambia a estado ACTIVE
- **Y** se mantiene trazabilidad de todos los cambios de estado

### ✅ Criterio 6: Creación Automática
- **Dado** que el sistema necesita crear una entidad descentralizada automáticamente
- **Cuando** se ejecuta el proceso de creación automática
- **Entonces** se crea la entidad con datos básicos disponibles
- **Y** se marca como `createdAutomatically = true`
- **Y** se asigna el estado INCOMPLETE
- **Y** se puede completar posteriormente con configuración SIGEC
- **Y** se registra la fuente de creación automática

## Tareas Técnicas Detalladas

### 🔹 Tarea 1: Extensión de Entidad Organization
- [ ] Agregar campos nuevos a `organization.entity.ts`
- [ ] Actualizar enum `OrdenType` cambiando `CentralizeEntity` a `DecentralizedEntity`
- [ ] Crear enum `EntityStatus` para estados de entidades
- [ ] Actualizar decoradores GraphQL apropiados
- [ ] Configurar nullable: true para campo opcional (`sigecToken`)
- [ ] Agregar validaciones de longitud y formato
- [ ] Implementar lógica para identificar entidades descentralizadas por `ordenType = DecentralizedEntity`
- [ ] Implementar lógica de transición de estados

### 🔹 Tarea 2: Actualización de DTOs
- [ ] Extender `CreateOrganizationInput` con campos descentralizados
- [ ] Extender `UpdateOrganizationInput` con campos descentralizados
- [ ] Agregar validaciones condicionales según `ordenType = DecentralizedEntity`
- [ ] Incluir campo `sigecToken` con validaciones específicas
- [ ] Actualizar DTOs de filtrado para incluir entidades descentralizadas

### 🔹 Tarea 3: Lógica de Servicio
- [ ] Actualizar `OrganizationService` con validaciones específicas
- [ ] Implementar método `validateDecentralizedEntity()`
- [ ] Implementar método `createDecentralizedEntityAutomatically()`
- [ ] Agregar validación de formato de `sigecToken`
- [ ] Implementar método para gestionar tokens SIGEC por entidad
- [ ] Implementar lógica de transición de estados (`updateEntityStatus()`)
- [ ] Agregar método `configureSigecIntegration()` para activar entidades
- [ ] Agregar lógica de negocio para entidades descentralizadas
- [ ] Mantener compatibilidad con organizaciones regulares
- [ ] Validar consistencia entre department y city
- [ ] Implementar queries para filtrar por estado y tipo de creación

### 🔹 Tarea 4: Base de Datos
- [ ] Crear migración para agregar nuevos campos a `vudec_organization`
- [ ] Crear migración para actualizar enum `OrdenType` (CentralizeEntity → DecentralizedEntity)
- [ ] Migrar datos existentes que usen `CentralizeEntity` a `DecentralizedEntity`
- [ ] Agregar índice para `sigecToken` y `ordenType`
- [ ] Verificar impacto en vistas y relaciones existentes
- [ ] Ejecutar pruebas de rendimiento con datos de ejemplo
- [ ] Validar que registros existentes mantengan compatibilidad

### 🔹 Tarea 5: APIs y Resolvers
- [ ] Actualizar resolver GraphQL de Organization
- [ ] Agregar filtros específicos para entidades descentralizadas
- [ ] Implementar gestión de tokens SIGEC vía API
- [ ] Agregar validaciones de seguridad para campo `sigecToken`
- [ ] Actualizar queries existentes para incluir nuevos campos
- [ ] Mantener compatibilidad con organizaciones padre/hijo

### 🔹 Tarea 6: Manejo de Estados y Flujos Automáticos
- [ ] Implementar servicio `EntityStatusManager`
- [ ] Crear flujo de creación automática de entidades
- [ ] Implementar validaciones por estado (INCOMPLETE, ACTIVE, etc.)
- [ ] Agregar endpoints para cambio de estado
- [ ] Implementar notificaciones de cambio de estado
- [ ] Crear métricas de entidades por estado
- [ ] Implementar cleanup de entidades INCOMPLETE antiguas

### 🔹 Tarea 7: Validaciones y Testing
- [ ] Implementar validaciones específicas para entidades descentralizadas
- [ ] Crear validaciones para formato de `sigecToken`
- [ ] Validar consistencia geográfica (department-city)
- [ ] Validar transiciones de estado permitidas
- [ ] Crear pruebas unitarias para nuevos campos y estados
- [ ] Agregar pruebas de integración incluyendo tokens SIGEC
- [ ] Probar flujo de creación automática
- [ ] Validar compatibilidad con funcionalidad existente
- [ ] Probar jerarquía de organizaciones descentralizadas
- [ ] Testing de cambios de estado y validaciones correspondientes

## Impacto en el Sistema

### ✅ Módulos Afectados
- **Organization Module**: Entidad principal, servicios y resolvers
- **General Module**: Relaciones con Department y City existentes
- **Contract Module**: Posibles relaciones con contratos gubernamentales
- **User Module**: Gestión de usuarios por organización descentralizada

### ✅ Beneficios Esperados
- Utilización de la entidad diseñada específicamente para este propósito
- Aprovechamiento de relaciones geográficas ya establecidas
- Gestión natural de jerarquías organizacionales
- Integración directa con estructura gubernamental existente
- Reutilización máxima de infraestructura de organizaciones

### ⚠️ Riesgos y Mitigaciones
| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Entidades INCOMPLETE sin seguimiento | Medio | Implementar métricas y alertas para entidades en estado incompleto |
| Complejidad en validaciones condicionales | Medio | Implementar validaciones específicas por estado de entidad |
| Creación automática con datos incompletos | Medio | Validaciones mínimas y proceso de completado posterior |
| Impacto en funcionalidad existente | Bajo | Campos nullable y validaciones retrocompatibles |
| Rendimiento en consultas por estado | Bajo | Índices apropiados en campos de estado y tipo |
| Gestión de tokens SIGEC por entidad | Medio | Servicio específico para gestión de tokens con estados |

## Definición de Terminado (DoD)

- [ ] Migración de base de datos ejecutada exitosamente
- [ ] Entidad `Organization` extendida con todos los campos requeridos
- [ ] Enum `OrdenType` actualizado de `CentralizeEntity` a `DecentralizedEntity`
- [ ] Migración de datos existentes completada
- [ ] Enum `EntityStatus` creado y funcional
- [ ] DTOs actualizados con validaciones apropiadas
- [ ] Validación que `ordenType = DecentralizedEntity` identifica entidades descentralizadas
- [ ] Flujo de creación automática implementado y probado
- [ ] Sistema de estados (INCOMPLETE, ACTIVE, etc.) funcional
- [ ] Servicios implementados con lógica de negocio específica
- [ ] Validaciones de consistencia geográfica (department-city) implementadas
- [ ] Gestión de tokens SIGEC por entidad funcional (opcional)
- [ ] Transiciones de estado validadas y controladas
- [ ] Pruebas unitarias implementadas (cobertura ≥ 80%)
- [ ] Pruebas de integración exitosas
- [ ] Validación con datos de ejemplo de entidades descentralizadas
- [ ] Testing de creación automática y manual
- [ ] Documentación técnica actualizada
- [ ] Sin impacto en funcionalidad existente de organizaciones regulares
- [ ] Aprobación del code review
- [ ] Deploy exitoso en ambiente de staging

## Estimación y Prioridad

- **Story Points**: 8
- **Prioridad**: Alta
- **Sprint Sugerido**: Sprint 1
- **Duración Estimada**: 1-2 semanas
- **Dependencias**: Ninguna crítica

## Enlaces y Referencias

- [📋 Epic 001 - Descentralizadas](../Epic%20001%20-%20Descentralizadas.md)
- [📖 Documentación Organization](../../../organizations/organization/docs/organization.md)
- [🗂️ Entidad Organization](../../../organizations/organization/entity/organization.entity.ts)
- [🔧 Enum OrdenType](../../../organizations/organization/enums/organization-orden.enum.ts)
- [📋 Documento Principal](../../ENTIDADES_DESCENTRALIZADAS.md)

---

**Fecha de Creación**: Octubre 2025  
**Última Actualización**: Octubre 2025  
**Responsable**: Equipo Backend  
**Estado**: 📋 Documentado - Listo para desarrollo

## Notas Adicionales

Esta HU es fundamental para el éxito de la Epic 001, ya que establece la base de datos que soportará todas las funcionalidades posteriores de gestión de entidades descentralizadas. La utilización de la entidad `Organization` es la decisión arquitectónicamente correcta, ya que fue diseñada específicamente para manejar entidades gubernamentales y ya cuenta con la infraestructura necesaria para departamentos, municipios y estructuras jerárquicas organizacionales.
