# HU002 - Arreglos y adaptaciones paneles de gestión

## Descripción de la Historia de Usuario

**Como** usuario administrativo del sistema VUDEC  
**Quiero** tener paneles de gestión adaptados y organizados para el manejo de entidades descentralizadas  
**Para que** pueda administrar eficientemente tanto los lotes diarios como los lotes de entidades descentralizadas, con una navegación clara y funcionalidades específicas para cada tipo

## Contexto y Justificación

Con la implementación de entidades descentralizadas en VUDEC, es necesario adaptar la interfaz de usuario para:

- **Distinguir claramente** entre lotes diarios y lotes de entidades descentralizadas
- **Reutilizar componentes** existentes maximizando la consistencia de UX
- **Organizar la navegación** de forma lógica y jerárquica
- **Proporcionar gestión específica** para entidades descentralizadas
- **Mostrar información contextual** sobre la entidad asociada a cada lote

## Cambios Específicos Requeridos

### 🔹 1. Reestructuración del Menú Principal

#### Estado Actual
```
📁 Root
  └── 📄 Lotes diarios de hechos generadores
```

#### Estado Objetivo
```
📁 Root
  └── 📁 Lotes de hechos generadores
      ├── 📄 Lotes diarios
      └── 📄 Lotes entidades descentralizadas
```

**Descripción**: Transformar el elemento de menú plano en una estructura jerárquica que permita distinguir entre los dos tipos de lotes.

#### Especificaciones Técnicas:
- Crear submenú expandible "Lotes de hechos generadores"
- Mantener la funcionalidad actual en "Lotes diarios"
- Agregar nueva opción "Lotes entidades descentralizadas"
- Implementar navegación coherente entre ambas secciones
- Mantener breadcrumbs apropiados

### 🔹 2. Reutilización de Gestión de Lotes

#### Objetivo
Adaptar la gestión existente de lotes diarios para crear una gestión similar para lotes de entidades descentralizadas, agregando una columna que identifique la entidad asociada.

#### Componentes a Reutilizar:
- **Tabla de lotes**: Layout, filtros, paginación, acciones
- **Formularios**: Crear/editar lote (con campos adicionales)
- **Modales**: Confirmaciones, detalles, alertas
- **Validaciones**: Lógica de negocio adaptada

#### Adaptaciones Requeridas:
- **Nueva columna**: "Entidad Descentralizada" en la tabla de lotes
- **Filtro adicional**: Por tipo de entidad descentralizada
- **Selector de entidad**: En formularios de creación/edición
- **Validaciones específicas**: Para entidades descentralizadas
- **Estados diferenciados**: Visual para tipos de lote

#### Tabla Comparativa de Funcionalidades:

| Funcionalidad | Lotes Diarios | Lotes Entidades Descentralizadas |
|---------------|---------------|-----------------------------------|
| Crear lote | ✅ Existente | 🆕 Agregar selector de entidad |
| Editar lote | ✅ Existente | 🆕 Permitir cambio de entidad |
| Eliminar lote | ✅ Existente | ✅ Mismo comportamiento |
| Filtrar por fecha | ✅ Existente | ✅ Mismo comportamiento |
| Filtrar por estado | ✅ Existente | ✅ Mismo comportamiento |
| Filtrar por entidad | ❌ No aplica | 🆕 Nueva funcionalidad |
| Ver movimientos | ✅ Existente | 🆕 Mostrar entidad en header |
| Exportar | ✅ Existente | 🆕 Incluir datos de entidad |

### 🔹 3. Nueva Sección en Configuración

#### Ubicación
**Configuración** → **Gestión de Entidades Descentralizadas**

#### Funcionalidades Requeridas:
- **Listado de entidades**: Tabla con filtros y búsqueda
- **Crear entidad**: Formulario con campos específicos (basado en HU001)
- **Editar entidad**: Modificación de datos existentes
- **Activar/Desactivar**: Control de estado de entidades
- **Validar datos**: Verificación de información con SIGEC
- **Historial de cambios**: Auditoría de modificaciones

#### Campos del Formulario (basado en HU001):
| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| Tipo de Entidad | Select | Sí | Lista de tipos permitidos |
| Número de Identificación | Input | Sí | Validación de formato |
| Dígito de Verificación | Input | Sí | Cálculo automático |
| Nombre de Entidad | Input | Sí | Texto libre |
| Departamento | Select | Sí | Lista de departamentos |
| Municipio | Select | Sí | Lista dependiente de departamento |
| Dirección de Notificación | Textarea | Sí | Dirección completa |
| Correo de Contacto | Email | Sí | Validación de formato |
| Teléfono de Contacto | Input | No | Formato de teléfono |
| Es Entidad Retenedora | Checkbox | Sí | Booleano |
| Código SIGEC | Input | No | Asignado por el sistema |

### 🔹 4. Información de Entidad en Cabecera de Lotes

#### Ubicación
En la vista de "Hechos generadores del lote" (como se muestra en las capturas)

#### Estado Actual
```
Hechos generadores del lote
ID. 2025050B024 - LOTE DIARIO DE NOTIFICACIÓN 2025-05-08
```

#### Estado Objetivo
```
Hechos generadores del lote
ID. 2025050B024 - LOTE DIARIO DE NOTIFICACIÓN 2025-05-08

// Para lotes de entidades descentralizadas:
Hechos generadores del lote
ID. 2025050B024 - LOTE ENTIDAD DESCENTRALIZADA 2025-05-08
Entidad: [NOMBRE DE LA ENTIDAD] - [TIPO] - [NÚMERO IDENTIFICACIÓN]
```

#### Especificaciones:
- **Condicional**: Solo mostrar información de entidad si el lote es de tipo descentralizado
- **Formato claro**: Nombre, tipo y número de identificación
- **Estilo consistente**: Mantener diseño actual con información adicional
- **Link opcional**: Permitir acceso rápido a editar la entidad

## Criterios de Aceptación

### ✅ Criterio 1: Reestructuración de Menú
- **Dado** que soy un usuario del sistema
- **Cuando** navego por el menú principal
- **Entonces** veo la estructura jerárquica "Lotes de hechos generadores"
- **Y** puedo acceder tanto a "Lotes diarios" como a "Lotes entidades descentralizadas"
- **Y** la navegación mantiene el contexto y breadcrumbs apropiados

### ✅ Criterio 2: Gestión de Lotes Reutilizada
- **Dado** que accedo a "Lotes entidades descentralizadas"
- **Cuando** interactúo con la interfaz
- **Entonces** veo la misma funcionalidad que en lotes diarios
- **Y** además puedo ver y filtrar por la columna "Entidad Descentralizada"
- **Y** puedo seleccionar una entidad al crear/editar lotes
- **Y** las validaciones son apropiadas para entidades descentralizadas

### ✅ Criterio 3: Configuración de Entidades
- **Dado** que soy un administrador
- **Cuando** accedo a Configuración → Gestión de Entidades Descentralizadas
- **Entonces** puedo realizar operaciones CRUD completas sobre entidades
- **Y** los formularios incluyen todos los campos requeridos
- **Y** las validaciones funcionan correctamente
- **Y** se mantiene auditoría de cambios

### ✅ Criterio 4: Información en Cabecera
- **Dado** que visualizo los movimientos de un lote de entidad descentralizada
- **Cuando** estoy en la vista de "Hechos generadores del lote"
- **Entonces** veo claramente qué entidad está asociada al lote
- **Y** la información incluye nombre, tipo e identificación
- **Y** el diseño es consistente con el resto de la aplicación

## Tareas Técnicas Detalladas

### 🔹 Tarea 1: Reestructuración de Menú
- [ ] Modificar estructura de navegación en el componente principal
- [ ] Crear submenú expandible para "Lotes de hechos generadores"
- [ ] Actualizar rutas y breadcrumbs
- [ ] Implementar navegación activa y estados
- [ ] Actualizar tests de navegación

### 🔹 Tarea 2: Componente de Lotes Reutilizable
- [ ] Crear componente base abstrayendo funcionalidad común
- [ ] Parametrizar diferencias entre lotes diarios y descentralizados
- [ ] Implementar columna de entidad descentralizada
- [ ] Agregar filtros específicos para entidades
- [ ] Adaptar formularios de creación/edición
- [ ] Implementar selector de entidades descentralizadas

### 🔹 Tarea 3: Sección de Configuración
- [ ] Crear componente de gestión de entidades descentralizadas
- [ ] Implementar tabla con filtros y búsqueda
- [ ] Crear formularios de CRUD para entidades
- [ ] Agregar validaciones del frontend
- [ ] Implementar manejo de estados (activo/inactivo)
- [ ] Integrar con APIs del backend (HU001)

### 🔹 Tarea 4: Cabecera de Lotes
- [ ] Modificar componente de cabecera de lotes
- [ ] Agregar lógica condicional para mostrar información de entidad
- [ ] Implementar formato de visualización de entidad
- [ ] Mantener consistencia de diseño
- [ ] Agregar link opcional a gestión de entidades

### 🔹 Tarea 5: Integración y Testing
- [ ] Integrar todos los componentes modificados
- [ ] Realizar pruebas de usabilidad
- [ ] Verificar responsividad en diferentes dispositivos
- [ ] Validar flujos de usuario completos
- [ ] Ejecutar tests de regresión

## Impacto en UX/UI

### ✅ Beneficios Esperados
- **Navegación más clara**: Estructura jerárquica intuitiva
- **Consistencia de experiencia**: Reutilización de patrones conocidos
- **Eficiencia operativa**: Gestión centralizada de entidades
- **Información contextual**: Claridad sobre la entidad asociada
- **Escalabilidad**: Base sólida para futuras funcionalidades

### ⚠️ Consideraciones de Diseño
- **Compatibilidad**: Mantener funcionalidad existente intacta
- **Performance**: Optimizar carga de datos de entidades
- **Accesibilidad**: Cumplir estándares de usabilidad
- **Responsive**: Adaptar a diferentes tamaños de pantalla
- **Estados de carga**: Feedback apropiado durante operaciones

## Wireframes y Mockups

### Estructura de Menú Propuesta
```
📱 VUDEC - Menú Principal
├── 🏠 Inicio
├── 📁 Lotes de hechos generadores
│   ├── 📄 Lotes diarios
│   └── 📄 Lotes entidades descentralizadas
├── 📋 Hechos generadores
├── 👥 Gestión de sujetos pasivos
└── ⚙️ Configuración
    ├── 📋 [Opciones existentes]
    └── 🏢 Gestión de Entidades Descentralizadas
```

### Vista de Lotes con Entidad (Modificación de tabla existente)
```
📊 Lotes entidades descentralizadas

[Filtros] [Entidad: Todas ▼] [Fecha] [Estado] [🔍 Buscar]

| ID Lote | Fecha | Entidad Descentralizada | Movimientos | Estado | Acciones |
|---------|-------|-------------------------|-------------|--------|----------|
| 2025... | 08/05 | ALCALDÍA GUADALAJARA   | 15         | Activo | [⚙️][👁️] |
| 2025... | 07/05 | INSTITUTO EDUCATIVO    | 8          | Enviado| [⚙️][👁️] |
```

## Definición de Terminado (DoD)

- [ ] Menú principal reestructurado funcionando correctamente
- [ ] Gestión de lotes de entidades descentralizadas operativa
- [ ] Sección de configuración de entidades implementada
- [ ] Información de entidad visible en cabecera de lotes
- [ ] Componentes reutilizables documentados
- [ ] Pruebas de usabilidad completadas exitosamente
- [ ] Responsive design validado en múltiples dispositivos
- [ ] Tests automatizados actualizados
- [ ] Code review aprobado
- [ ] Deploy exitoso en ambiente de staging
- [ ] Validación con usuarios finales

## Estimación y Prioridad

- **Story Points**: 5
- **Prioridad**: Media
- **Sprint Sugerido**: Sprint 2
- **Duración Estimada**: 1-1.5 semanas
- **Dependencias**: HU001 (base de datos y APIs)

## Enlaces y Referencias

- [📋 Epic 001 - Descentralizadas](./Epic%20001%20-%20Descentralizadas.md)
- [🗄️ HU001 - Entidad (DB) descentralizada](./HU001%20-%20Entidad%20(DB)%20descentralizada.md)
- [📋 Documento Principal](../../ENTIDADES_DESCENTRALIZADAS.md)
- [🎨 Guía de Estilo UI/UX](../../UI_STYLE_GUIDE.md) *(si existe)*

---

**Fecha de Creación**: Octubre 2025  
**Última Actualización**: Octubre 2025  
**Responsable**: Equipo Frontend  
**Estado**: 📋 Documentado - Listo para desarrollo

## Notas Adicionales

- Esta HU se enfoca en maximizar la reutilización de componentes existentes
- La implementación debe mantener total compatibilidad con funcionalidades actuales
- Se debe prestar especial atención a la experiencia de usuario durante la transición
- La documentación de componentes reutilizables facilitará futuras implementaciones
