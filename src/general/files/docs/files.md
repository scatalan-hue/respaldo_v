[Home](../../../../../README.md) > [General Module Documentation](../../docs/general.md) > [Files Module Documentation]

# **Module: Files**

## **Description**

The Files module is a crucial part of the VUDEC system that manages all operations related to file handling. This module provides comprehensive functionality for file management, including uploading, downloading, and storing files in various formats and locations. It is designed to integrate seamlessly with other system components, ensuring data consistency, security, and efficient access to file resources.

## **Features**

### **File Management**
* Upload, download, and manage files
* Support for multiple file storage modes (buffer, MongoDB, URL)
* Validate and process file content
* Implement data integrity checks
* Maintain audit trails

## **Controllers / Resolvers**

### **Controllers**
Located in `controllers/files.controller.ts`

#### Endpoints

##### POST /attachment/files
Uploads files using multipart/form-data. This endpoint allows users to upload files to the system, which are then processed and stored according to the configured file mode.

###### Request Details
- **Method:** POST
- **Path:** /attachment/files
- **Content-Type:** multipart/form-data
- **Authentication:** Required (Bearer Token)

###### Request Body
- **file:** Binary file data

###### Response
- **Body:** Array of FileInfo objects representing the uploaded files

##### POST /attachment/files/uploadFileBase64
Uploads a file using a base64 encoded string. This endpoint allows users to upload files by providing the file content in base64 format.

###### Request Details
- **Method:** POST
- **Path:** /attachment/files/uploadFileBase64
- **Content-Type:** application/json
- **Authentication:** Required (Bearer Token)

###### Request Body
```json
{
  "filename": "example.pdf",
  "content": "base64string"
}
```

###### Response
- **Body:** FileInfo object representing the uploaded file

##### POST /attachment/files/findOrCreateFileBySource
Finds or creates a file based on the provided source information. This endpoint allows users to either find an existing file or create a new one using base64 content or a URL.

###### Request Details
- **Method:** POST
- **Path:** /attachment/files/findOrCreateFileBySource
- **Content-Type:** application/json
- **Authentication:** Required (Bearer Token)

###### Request Body
```json
{
  "fileId": "optional-file-id",
  "fileBase64": "optional-base64-content",
  "filename": "optional-filename",
  "fileUrl": "optional-file-url"
}
```

###### Response
- **Body:** FileInfo object representing the found or created file

##### GET /attachment/files/download/:id
Downloads a file by its ID. This endpoint allows users to download files stored in the system.

###### Request Details
- **Method:** GET
- **Path:** /attachment/files/download/:id
- **Authentication:** Required (Bearer Token)

###### Response
- **Content-Type:** Based on file type
- **Body:** Binary file data

##### GET /attachment/files/static/:id.:ext
Serves static files by ID and extension. This endpoint allows users to access static files directly.

###### Request Details
- **Method:** GET
- **Path:** /attachment/files/static/:id.:ext
- **Authentication:** Required (Bearer Token)

###### Response
- **Content-Type:** Based on file type
- **Body:** Binary file data

### **Resolvers**
Located in `resolvers/files.resolver.ts`

#### GraphQL Operations

##### Queries

###### file
```graphql
query File($id: ID!) {
  file(id: $id) {
    id
    fileName
    fileExtension
    fileMode
  }
}
```
- **Description:** Retrieves a specific file by ID, including basic information.
- **Access:** Public
- **Parameters:**
  - `id`: ID of the file to retrieve
- **Returns:** Promise<FileInfo> - Returns the found file

## **Services**

### **FilesService**
Located in `services/files.service.ts`

#### Core Methods

##### create
```typescript
async create(context: IContext, createFileInput: CreateFileInput): Promise<FileInfo>
```
- **Description:** Creates a new file in the system.
- **Parameters:**
  - `context`: IContext object containing request context
  - `createFileInput`: CreateFileInput containing the file data
- **Returns:** Promise<FileInfo> - Returns the created file

##### createFileBase64
```typescript
async createFileBase64(context: IContext, body: CreateFileBase64Input)
```
- **Description:** Creates a file from a base64 encoded string.
- **Parameters:**
  - `context`: IContext object containing request context
  - `body`: CreateFileBase64Input containing the base64 content and filename
- **Returns:** Promise<FileInfo> - Returns the created file

##### findOrCreateFileBySource
```typescript
async findOrCreateFileBySource(context: IContext, fileInput: CreateFileBySourceInput)
```
- **Description:** Finds or creates a file based on the provided source information.
- **Parameters:**
  - `context`: IContext object containing request context
  - `fileInput`: CreateFileBySourceInput containing the source information
- **Returns:** Promise<FileInfo> - Returns the found or created file

##### download
```typescript
async download(context: IContext, id: string, res: Response): Promise<void>
```
- **Description:** Downloads a file by its ID.
- **Parameters:**
  - `context`: IContext object containing request context
  - `id`: ID of the file to download
  - `res`: Express response object for file download
- **Returns:** Promise<void> - Indicates successful download

### **FilesManagerService**
Located in `services/files-manager.service.ts`

#### Core Methods

##### uploadFileBuffer
```typescript
async uploadFileBuffer(buffer: Buffer, fileName: string)
```
- **Description:** Uploads a file buffer to the storage system.
- **Parameters:**
  - `buffer`: Buffer containing the file data
  - `fileName`: Name of the file
- **Returns:** Promise<string> - Returns the ID of the uploaded file

##### uploadFileBase64
```typescript
async uploadFileBase64(body: CreateFileBase64Input)
```
- **Description:** Uploads a file using a base64 encoded string.
- **Parameters:**
  - `body`: CreateFileBase64Input containing the base64 content and filename
- **Returns:** Promise<string> - Returns the ID of the uploaded file

## **Data Layer (Models & Data Structures)**

### **Entities**
Located in `entities/file-info.entity.ts`

#### Database Table
- **Table Name:** grl_file
- **Inherits:** CrudEntity

#### Fields

##### Basic Information
| Field | Type | Nullable | Description | GraphQL Type |
|-------|------|----------|-------------|--------------|
| fileName | string | No | Name of the file | String |
| fileExtension | string | No | Extension of the file | String |
| fileMode | FileModes | No | Storage mode of the file | FileModes |
| fileBuffer | Buffer | Yes | Binary data of the file | Buffer |
| fileMongoId | string | Yes | MongoDB ID of the file | String |

### **DTOs (Data Transfer Objects)**
Located in `dto/inputs/create-file.input.ts`, `dto/inputs/create-file-base64.input.ts`, `dto/inputs/create-file-by-source.input.ts`, `dto/inputs/update-file.input.ts`

#### CreateFileInput
##### Description
Data Transfer Object for creating a new file in the system. Defines the data structure required to create a file, including validations.

##### Fields
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| fileName | string | Yes | Name of the file | - IsString |
| fileExtension | string | No | Extension of the file | - IsString |
| fileBuffer | string | No | Binary data of the file | - IsString |
| fileMongoId | string | No | MongoDB ID of the file | - IsMongoId |

#### CreateFileBase64Input
##### Description
Data Transfer Object for creating a file from a base64 encoded string.

##### Fields
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| filename | string | Yes | Name of the file | - IsString |
| content | string | Yes | Base64 encoded content of the file | - IsString |

#### CreateFileBySourceInput
##### Description
Data Transfer Object for finding or creating a file based on source information.

##### Fields
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| filename | string | No | Name of the file | - IsString |
| fileId | string | No | ID of an existing file | - IsUUID |
| fileUrl | string | No | URL of the file | - IsString |
| fileBase64 | string | No | Base64 encoded content of the file | - IsString |

#### UpdateFileInput
##### Description
Data Transfer Object for updating an existing file in the system.

##### Fields
| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|------------------|
| id | string | Yes | ID of the file | - IsUUID |

### **Models**
Located in `dto/models/file-info.model.ts`, `dto/models/file-response.model.ts`

#### MongoFileInfo
##### Description
Model representing file information stored in MongoDB.

##### Fields
| Field | Type | Description |
|-------|------|-------------|
| length | number | Length of the file |
| chunkSize | number | Chunk size of the file |
| filename | string | Name of the file |
| md5 | string | MD5 hash of the file |
| contentType | string | MIME type of the file |

#### MongoFileResponse
##### Description
Model representing the response for a file operation in MongoDB.

##### Fields
| Field | Type | Description |
|-------|------|-------------|
| message | string | Response message |
| file | MongoFileInfo | File information |

### **Enums (Enumerations)**
Located in `enums/file-modes.enum.ts`

#### FileModes
##### Description
Defines the storage modes available for files in the system.

##### Values
| Value | Description |
|-------|-------------|
| buffer | File stored in memory buffer |
| mongo | File stored in MongoDB |
| url | File stored as a URL reference |

### **Functions**
Located in `functions/content-type.ts`

#### getMimeTypeFromExtension
##### Description
Function to get the MIME type based on file extension.

##### Parameters
- **extension:** string - The file extension

##### Returns
- **string | undefined:** The corresponding MIME type or undefined if not found

## **Module**

### **FilesModule**
Located in `files.module.ts`

#### Description
Module that groups all components related to file management, including entities, resolvers, services, controllers, and DTOs.

#### Providers
- FilesResolver
- FilesService
- FilesManagerService
- GridFsMulterConfigService
- UploadService

#### Imports
- TypeOrmModule for the FileInfo entity
- MulterModule for file uploads
- HttpModule for HTTP requests

#### Controllers
- FilesController 