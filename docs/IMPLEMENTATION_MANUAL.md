# Manual de Implementación VUDEC
*Ventanilla Única para la Desmaterialización de Estampillas Contractuales*

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Instalación y Configuración](#instalación-y-configuración)
3. [Inicialización del Sistema](#inicialización-del-sistema)

---

## 🎯 Introducción

### Propósito del Manual

Este manual proporciona una guía completa para la implementación del sistema VUDEC (Ventanilla Única para la Desmaterialización de Estampillas Contractuales) en entornos de producción y desarrollo.

### Alcance del Sistema

VUDEC automatiza la gestión, reporte, adhesión y pago de estampillas contractuales, cumpliendo con las normativas establecidas en el Artículo 13 de la Ley 2052 de 2020 para integración con SIGEC.

### Audiencia

- **Administradores de Sistema**
- **DevOps Engineers**
- **Desarrolladores Backend**
- **Equipos de Infraestructura**

---

## 🚀 Instalación y Configuración

### Clonación y Configuración del Proyecto

### Clonación y Configuración del Proyecto

```bash
# Clonar repositorio
git clone https://srodriguez6@bitbucket.org/cs3dev/vude-backend.git

cd vudec-backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env-example .env
```

### Configuración de Variables de Entorno

Editar el archivo `.env` con las configuraciones específicas basándose en `.env-example`:

```env
# ===========================================
# CONFIGURACIÓN BÁSICA DE LA APLICACIÓN
# ===========================================

# Aplicación
STATE=production
APP_PORT=3000
NAME=VUDEC
APP_URL=https://your-domain.com
FRONT_URL=https://your-frontend-domain.com
HOST=your-server-ip
HTTPS=true

# ===========================================
# CERTIFICADOS SSL
# ===========================================

# SSL Configuration
CERT_PFX=src/certs/SoftTribCertNest.pfx
CERT_BODY=src/certs/cert.pem
CERT_KEY=src/certs/key.pem
CERT_PASS=src/certs/softtrib.pass

# ===========================================
# INTEGRACIONES EXTERNAS
# ===========================================

# SIGEC Integration
SIGEC_TOKEN=your-sigec-bearer-token
SIGEC_URL=https://api.sigec.gov.co

# Certimails
CERTIMAILS_URL=https://certimails.com/

# ===========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ===========================================

# SQL Server/PostgreSQL/MySQL Configuration
DB_TYPE=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=VUDEC
TZ=America/Bogota

# MongoDB Configuration
DB_FILE_MODE=MONGODB
DB_MONGODB_SERVER=mongodb://localhost:27017
DB_MONGODB_NAME=vudec

# Database Sync
DB_SYNC_VIEWS=false

# ===========================================
# CACHE Y REDIS
# ===========================================

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# ===========================================
# SEGURIDAD Y AUTENTICACIÓN
# ===========================================

# JWT Configuration
JWT_SECRET=ultra-secret-change-in-production
JWT_EXPIRES_IN=24h

# API Key Security
API_KEY_SECRET=ultra-secret-change-in-production
API_KEY_SECRET_SALT=12

# Super Admin (Initial Setup)
SA_EMAIL=admin@your-domain.com
SA_PASSWORD=change-this-password

# ===========================================
# CONFIGURACIÓN DE ARCHIVOS
# ===========================================

# File Upload
FILES_UPLOAD_LIMIT=50mb

# ===========================================
# SERVICIOS ADICIONALES
# ===========================================

# Kafka
KAFKA=production

# ===========================================
# DOCKER Y KUBERNETES (DEPLOYMENT)
# ===========================================

# Docker
DOCKER_IMAGE_NESTJS=vudec-image:v1.0.0

# Kubernetes
KUBE_DASHBOARD_USERNAME=admin-user
KUBE_NAME_SPACE=vudec-prod
KUBE_NAME_APP=vudec
```

### Inicialización del Sistema

#### Paso 1: Ejecutar la Aplicación

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

#### Paso 2: Configurar Super Administrador

Una vez que la aplicación esté ejecutándose, es necesario inicializar el super administrador del sistema. Esto se hace ejecutando la siguiente mutación en GraphQL:

**Acceder a GraphQL Playground:**
- Desarrollo: `http://localhost:3000/graphql`
- Producción: `https://your-domain.com/graphql`

**Ejecutar la mutación:**

```graphql
mutation ResetSuperAdmin {
  resetSuperAdmin {
    id
    createdAt
    updatedAt
    deletedAt
    name
    middleName
    lastName
    secondSurname
    email
    identificationType
    identificationNumber
    dateIssue
    legalRepresentativeIdentificationType
    legalRepresentativeIdentificationNumber
    phoneCountryCode
    phoneNumber
    address
    hasRural
    confirmationCode
    hasExternalCreation
    temporalPassword
    status
    credentialsExpirationDate
    phoneVerification
    emailVerification
    type
    fullName
  }
}
```

Esta mutación creará o restablecerá el usuario super administrador usando las credenciales configuradas en las variables de entorno:
- **Email:** `SA_EMAIL`
- **Password:** `SA_PASSWORD`

#### Paso 3: Configurar Organización

Después de inicializar el super administrador, es necesario configurar la organización que utilizará el sistema.

Para configurar una organización, sigue la documentación detallada disponible en:

**📋 [Webservice - Gestión de Organizaciones del Sistema](https://cs3develop.getoutline.com/doc/webservice-gestion-de-organizaciones-del-sistema-zjRqg1BauY)**

Esta documentación incluye:
- Creación de organizaciones
- Configuración de productos por organización  
- Asignación de usuarios a organizaciones
- Configuración de permisos y roles



#### Verificación de la Instalación

Una vez completados todos los pasos anteriores, verifica que el sistema esté funcionando correctamente:

1. **Health Check:** Accede a `http://localhost:3000/health` (o tu dominio/health)
2. **GraphQL Playground:** Verifica que puedas acceder al playground de GraphQL
3. **Autenticación:** Confirma que puedes autenticarte con las credenciales del super administrador
4. **Organización:** Verifica que la organización se haya creado correctamente

### Notas Importantes

- El super administrador es necesario para la configuración inicial del sistema
- La organización debe configurarse antes de comenzar a usar las funcionalidades de VUDEC
- Asegúrate de cambiar las credenciales por defecto en entornos de producción
- Guarda las credenciales del super administrador en un lugar seguro

---

*Documento versión 1.0 - Última actualización: Agosto 2025*
