# Proceso VUDEC para Entidades Descentralizadas

## Introducción

Este documento describe el proceso implementado en VUDEC para el manejo de **entidades descentralizadas** que participan en el sistema de recaudo y reporte de estampillas municipales y departamentales.

## Contexto

Las entidades descentralizadas son organizaciones que tienen la función de:

1. **Retener estampillas** municipales o departamentales durante sus procesos
2. **Reportar estas retenciones** a través de declaraciones y exógenas
3. **Informar al ente dueño** de la estampilla sobre los valores retenidos

## Objetivo del Sistema

El sistema VUDEC debe:

- Mantener un **registro actualizado** de las entidades descentralizadas
- **Modificar el cálculo** del request de envío a SIGEC basado en el tipo de entidad
- Facilitar el **flujo de información** entre SWIT y VUDEC para entidades descentralizadas
- Asegurar la **trazabilidad** de los procesos de retención y reporte

## Flujo de Proceso

### 1. Registro de Entidades
- Las entidades descentralizadas deben estar registradas en VUDEC
- El registro incluye información sobre el tipo de entidad y las estampillas que maneja

### 2. Recepción de Solicitudes
- SWIT envía solicitudes para entidades descentralizadas
- VUDEC identifica el tipo de entidad y aplica la lógica correspondiente

### 3. Procesamiento Diferenciado
- El cálculo del request a SIGEC se modifica según el tipo de entidad
- Se aplican reglas específicas para entidades descentralizadas

### 4. Reporte y Seguimiento
- Se genera la información necesaria para declaraciones y exógenas
- Se mantiene trazabilidad del proceso completo

## Impacto en el Sistema

### Modificaciones Requeridas
- Adaptación del módulo de cálculo para SIGEC
- Nuevas APIs para manejo de entidades descentralizadas
- Actualización de procesos de contratación
- Mejoras en la gestión contractual

### Beneficios Esperados
- Mayor precisión en los cálculos de estampillas
- Mejor control sobre entidades descentralizadas
- Facilidad en el proceso de declaraciones
- Cumplimiento normativo mejorado

## Documentación Relacionada

- [Épicas del Proyecto](./EPICAS.md)
- [Historias de Usuario](./HISTORIAS_USUARIO.md)
- [Manual de Implementación](./IMPLEMENTATION_MANUAL.md)

---

**Fecha de creación:** Octubre 2025  
**Versión:** 1.0  
**Estado:** En desarrollo