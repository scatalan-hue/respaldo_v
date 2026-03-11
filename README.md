# VUDEC

## 1. Introduction

### 1.1 Document Purpose

The purpose of this document is to define the strategic vision of the "***Single Window for Stamp Dematerialization***" (VUDEC). This product's main objective is to have comprehensive management of each of the stamps that have been assessed and paid for each contract of the entity for their respective reporting to the system established by SECOP called SIGEC, a process that corresponds to regulatory compliance established in "*[Article 13 of Law 2052 of 2020](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=140250#:\~:text=ART%C3%8DCULO%2013.,el%20criterio%20de%20equivalencia%20funcional.)*".

### 1.2 Product Scope

The product will automate all functions related to the management, reporting, adhesion, and payment of different contractual stamps, a type of documentary tax authorized by law. This system will provide complete administration of contracts, including tracking of stamps associated with each one, as well as the different states that contracts go through during their lifecycle.

In addition, the product will feature integration through web services (WebServices) with the Contractual Stamps Management Information System (SIGEC), facilitating automatic and updated reporting of each contract. The system will be offered under a **Software as a Service (SaaS)** model, which will allow entities to access the solution in a flexible, secure, and scalable way, without the need for additional infrastructure.

### 1.3 Document Audience

This product is aimed at key project stakeholders, including:

* Product Owner, Scrum Master, and Functional Analyst
* Development and design team
* Helpdesk support team

## 2. Product Vision

### 2.1 Product Description

The **Single Window for Stamp Dematerialization** is a cloud-based platform designed for the administration, management, and control of processes related to the reporting, adhesion, and payment of contractual stamps. The system has the capability to integrate with any information system through a set of reactive APIs. The system will have information synchronization mechanisms that will allow users to generate management reports and managerial statistics in real-time.

The end user will be able to manage the entire process autonomously, with an intuitive and accessible interface. Additionally, the platform will feature an exclusive administrative view for **CS3** (our company), which will allow consulting usage statistics and monitoring the behavior of clients (end users), providing a comprehensive view of system performance.

### 2.2 Main Benefits

* **Process Automation:** The system will automatically report contractual stamps
* **Error Minimization:** Minimizes human errors through the automation of loading information of different contractual stamps through Webservices and/or SQL interfaces
* **Real-time Queries:** Provides a dashboard that allows managers to see the status of different stamp reporting processes
* **Error Control:** Offers a clear and accessible scheme for querying and managing errors, facilitating their correction and adjustments in information, which guarantees the accuracy and continuity of processes
* **Real-time Notifications:** Being integrated with our **Certimails** platform, the system generates automatic notifications to keep all involved parties informed about the status of ongoing reporting processes

### 2.3 Problem Statement

The control entities responsible for the liquidation and collection of contractual stamps, as established in **Article 13 of Law 2052 of 2020**, are obligated to report these stamps through digital mechanisms to the SIGEC system. However, many of these entities face difficulties in efficiently complying with this obligation due to the lack of adequate technological tools that automate and facilitate this process, which can lead to errors, delays, and a lack of control in the management of stamps.

### 2.4 Target Audience

* Municipal officials
* Officials from decentralized entities
* Officials from governorates
* Contractors from different public entities

The target audience of this scope document includes any entity sanctioned according to the provisions of **Article 13 of Law 2052 of 2020**, which regulates the obligation to manage and report the payment of contractual stamps.

## 3. Product Objectives

### 3.1 Short-term Objectives (1 month)

* **Beta Version Launch:** Deploy a minimal functional version of the product (MVP) that includes all the visual scope established in the UX design
* **Feedback Collection:** Obtain feedback from key users to identify areas for improvement and adjust the product before the final launch
* **Initial Integrations:** Complete the integration of the system with the **SIIAFE** and **SWIT** platforms (in SWIT, only for the functionality of liquidation and payment of minor revenues)

### 3.2 Medium-term Objectives (2 months)

* **Exogenous Upload Tool:** Implement a tool for lower-order entities (municipalities) to upload exogenous files of stamp payments and report them to higher-order entities (governorates)
* **Information Entry Functionality:** Develop and implement functionalities that allow manual entry of information for stamp liquidation, ensuring precision and ease of use for users without automation
* Implement CS3 managerial query processes

### 3.3 Key Success Indicators (KPIs)

* Implement the tool productively in clients with whom we have contractual commitments
* Stability of the platform in the production stage

## 4. Technology Stack and Architecture

### 4.1 Technology Stack
* **Backend:** 
  * NestJS
  * TypeScript
  * GraphQL
  * TypeORM
  * MongoDB
  * MSSQL
* **Database:** 
  * MongoDB (Primary database)
  * MSSQL (Secondary database)
* **Additional Technologies:**
  * JWT (Authentication)
  * Swagger (API Documentation)
  * Certimails (Certificated communications)

### 4.2 High-Level Architecture Diagram

The VUDEC system implements a layered architecture that facilitates integration with external systems (SIIAFE, SWIT, SIGEC) through RESTful APIs. The following representation shows the main components and their interactions:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    SIIAFE/      │     │    Backend      │     │   Databases     │
│     SWIT        │◄───►│   (NestJS)      │◄───►│   (MongoDB/     │
│                 │     │                 │     │    MSSQL)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         ▲                       ▲                     ▲
         │                       │                     │
         ▼                       │                     ▼
┌─────────────────┐             │              ┌─────────────────┐
│     SIGEC       │◄────────────┘              │   File Storage  │
│   Integration   │                            │   (GridFS)      │
│                 │                            │                 │
└─────────────────┘                            └─────────────────┘
         ▲                                             ▲
         │                                             │
         ▼                                             │
┌─────────────────┐                                    │
│   Certimails    │◄───────────────────────────────────┘
│  Notifications  │
│                 │
└─────────────────┘
```

### 4.3 Integration Flows and Processes

The system implements several key process flows for stamp management:

#### Registration and Authentication Flow
1. The end user accesses the VUDEC system from SIIAFE
2. Credential validation is performed, and a JWT is generated
3. The VUDEC system validates and registers the user if necessary
4. Authentication is completed, and the JWT is returned for continuous access

#### Contract and Movement Management Flow
1. It starts with the registration of a payment order in SIIAFE
2. The system evaluates the applicable conditions and withholdings
3. VUDEC receives the information and processes the different types of movements:
   - Registration of adhesion movement
   - Registration of payment movement
   - Registration of cancellation movement
4. The system notifies interested parties about the registered changes

#### SIGEC Synchronization Process
1. VUDEC prepares and validates the data for sending to SIGEC
2. The information is sent through REST WebServices
3. SIGEC processes and responds to VUDEC
4. VUDEC records the response and notifies interested parties

### 4.4 Project Structure

```
src/
├── external-api/     # External system integrations (SIIAFE, SWIT, SIGEC)
├── security/         # Authentication, users, roles, and audit functionality
├── database/         # Database configuration and setup
├── general/          # General modules (notifications, locations, file management)
├── common/           # Shared utilities, interfaces, enums, DTOs, and constants
├── main/             # Core VUDEC business logic modules
└── patterns/         # CRUD pattern implementations and development patterns
├── certs/            # SSL certificates for secure communication
```

#### Directory Details:

- **external-api/**: Contains modules for external system integrations, managing connections with SIIAFE, SWIT, SIGEC, and other external applications.

- **security/**: Houses all security-related functionality including:
  - User authentication and authorization
  - Role management
  - Audit logging
  - Security configurations

- **general/**: Contains general-purpose modules:
  - Notification systems
  - Geographic data (departments, cities, countries)
  - File management
  - Other utility modules

- **database/**: Manages database configurations and connections for both MongoDB and MSSQL.

- **common/**: Shared resources across the application:
  - Reusable functions
  - Interfaces
  - Enums
  - DTOs
  - Constants
  - Other common utilities

- **main/**: Core business logic of VUDEC:
  - Primary application features
  - Business rules
  - Core functionality implementations

- **patterns/**: Contains:
  - Simplified CRUD operation patterns
  - Service and resolver templates
  - Development patterns and standards

- **certs/**: Provides SSL certificates for secure communication:
  - Certificate management for HTTPS
  - Configuration for secure connections

## Installation and Setup

### **Requirements**

* **Node.js**: Version 18 or higher
* **PostgreSQL**: Version 14 or higher
* **NPM**: Version 9 or higher

### **Installation and Setup**

1. **Clone the Repository**
   ```bash
   git clone [REPOSITORY_URL]
   cd vudec-backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   * Create a new file named `.env` in the root directory
   * Copy from the example: `cp .env-example .env`
   * Add the following configuration to the `.env` file:
     ```env
     # Application Configuration
     STATE=dev
     APP_PORT=3000
     NAME=VUDEC
     APP_URL=https://localhost
     FRONT_URL=http://localhost:4200
     HTTPS=false
     
     # Database Configuration
     DB_MONGODB_SERVER=mongodb://localhost:27017
     DB_MONGODB_NAME=vudec_dev
     
     # Security
     JWT_SECRET=your-super-secure-jwt-secret
     API_KEY_SECRET=ultra-secret-change-in-production
     
     # SIGEC Integration
     SIGEC_URL=https://preprosigec.colombiacompra.gov.co/gateway/stamp/v1/stamp/
     SIGEC_TOKEN=your-sigec-bearer-token
     
     # Redis
     REDIS_HOST=localhost
     REDIS_PORT=6379
     ```

4. **Start the Application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

5. **Initialize Super Administrator**

   After the application is running, you need to initialize the super administrator. Access the GraphQL Playground:
   - Development: `http://localhost:3000/graphql`
   - Production: `https://your-domain.com/graphql`

   Execute the following mutation:
   ```graphql
   mutation ResetSuperAdmin {
     resetSuperAdmin {
       id
       email
       fullName
       status
       type
     }
   }
   ```

   This will create/reset the super administrator using the credentials from environment variables (`SA_EMAIL` and `SA_PASSWORD`).

6. **Configure Organization**

   After initializing the super administrator, configure the organization that will use the system. Follow the detailed documentation:

   **📋 [Organization Management Webservice Documentation](https://cs3develop.getoutline.com/doc/webservice-gestion-de-organizaciones-del-sistema-zjRqg1BauY)**

**Important Note**: The super administrator initialization and organization configuration are required before using VUDEC's functionality.

## Documentation Navigation

VUDEC provides detailed technical documentation covering all aspects of the system. The documentation is organized hierarchically, starting with an overview of the system and diving deeper into each specific module.

### Documentation Structure

- **[System Modules Documentation](src/docs/modules.md)**: Comprehensive technical documentation covering all VUDEC system modules. This documentation provides:
  - Detailed description of each main module
  - Key features and responsibilities
  - Relationships between modules
  - Development best practices
  - Navigation to specific module documentation

### Documentation Location

The technical documentation is organized as follows:

1. **General Documentation**: `/src/docs/`
   - System modules: `modules.md`
   - Main application module: `app-module.md`
   - Application entry point: `main.md`

2. **Module-specific Documentation**: Each main module has its own documentation in:
   - `/src/{module-name}/docs/{module-name}.md`

This structure ensures that documentation is easily accessible and maintainable, allowing developers to quickly find the specific information they need.

