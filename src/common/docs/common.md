[Home](../../../README.md) > [Common Module Documentation]

# **Common Module Documentation**

## **Introduction**

The Common Module is a foundational component of the VUDEC system that provides shared utilities, interfaces, enumerations, and helper functions used throughout the application. This documentation aims to help new developers understand the structure, purpose, and proper usage of the components within this module.

## **Overview**

The Common Module serves as a centralized location for code that is reused across different parts of the application. It helps maintain consistency, reduces code duplication, and promotes standardization across the codebase. The module includes utilities for internationalization, type definitions, error handling, and various helper functions.

## **Directory Structure**

The Common Module is organized into several subdirectories, each with a specific purpose:

```
src/common/
├── constants/        # Application-wide constant values
├── decorators/       # Custom decorators for NestJS
├── dto/              # Data Transfer Objects shared across modules
├── enum/             # Enumeration types used throughout the application
├── functions/        # Utility functions and helper methods
├── i18n/             # Internationalization resources and translations
├── interfaces/       # Common TypeScript interfaces
├── report/           # Report generation utilities
├── scalars/          # Custom GraphQL scalar types
├── types/            # TypeScript type definitions
└── utils/            # General utility functions
```

## **Detailed Components**

### **Constants (`src/common/constants/`)**

#### `variables.constants.ts`
Defines application-wide constant values for configuration and settings:

- `STATIC_FILES_ROUTE`: Path for static file serving (`'/attachment/files/static'`)
- `SPECIAL_CHAR`: Defines special characters for validation (`'!$%*?'`)
- `dateFormat`: Format for date serialization (`'YYYY-MM-DDTHH:mm:ss.SSS[Z]'`)
- `dateFormatExit`: Format for dates when exiting the system
- `dateFormatEnter`: Format for dates when entering the system (`'YYYY-MM-DD HH:mm:ss.SSS'`)
- `dateFormatTypeOrm`: Format used by TypeORM (`'YYYY-MM-DD 00:00:00.000'`)
- `dateFormatHourAndMinute`: Format for displaying hours and minutes (`'HH:mm'`)

**Usage Example:**
```typescript
import { dateFormat } from 'src/common/constants/variables.constants';
import moment from 'moment';

const formattedDate = moment().format(dateFormat);
```

### **Decorators (`src/common/decorators/`)**

#### `request-ip.decorator.ts`
A custom parameter decorator that extracts the client's IP address from a request in both HTTP and GraphQL contexts.

**Implementation Details:**
```typescript
@UserIp()
```
This decorator retrieves the IP address from either the HTTP request or the GraphQL context.

**Usage Example:**
```typescript
import { UserIp } from 'src/common/decorators/request-ip.decorator';

@Controller('example')
export class ExampleController {
  @Get()
  getExample(@UserIp() ip: string) {
    return `Your request came from IP: ${ip}`;
  }
}
```

### **DTOs (Data Transfer Objects) (`src/common/dto/`)**

#### `filter.dto.ts`
Defines Data Transfer Objects for pagination, filtering, and sorting operations throughout the application.

**Key Classes:**
- `FilterDto`: Input type for filtering, pagination, and sorting:
  - `limit`: Number of items per page
  - `page`: Current page number
  - `route`: Optional route for navigation
  - `filt`: Optional filter string
  - `group`, `sort`, `tag`: Additional filtering options
  
- `MetaPagination`: Output type that contains pagination metadata:
  - `totalItems`: Total number of items
  - `itemCount`: Number of items in current page
  - `itemsPerPage`: Items per page
  - `totalPages`: Total number of pages
  - `currentPage`: Current page number

- `paginationMixin<T>`: A utility function to create pagination-enabled DTOs

**Usage Example:**
```typescript
import { FilterDto } from 'src/common/dto/filter.dto';

@Controller('items')
export class ItemsController {
  @Get()
  async getItems(@Body() filterDto: FilterDto) {
    return this.itemsService.findAll(filterDto);
  }
}
```

### **Enumerations (`src/common/enum/`)**

#### `application-stage.enum.ts`
Defines stages in the application workflow process:

```typescript
export enum ApplicationStage {
  TermsConditions = 'termsConditions',
  Data = 'data',
  Signer = 'signer',
  DocumentType = 'documentType',
  Attachments = 'attachments',
  Confirm = 'confirm',
  Pending = 'pending',
}
```

#### `application-state.enum.ts`
Defines possible states for applications in the system:

```typescript
export enum ApplicationState {
  Draft = 'draft',
  Pending = 'pending',
  Approved = 'approved',
  Declined = 'declined',
  Canceled = 'canceled',
  Error = 'error',
}
```

#### `audit-level.enum.ts`
Defines audit logging levels for application operations:

```typescript
export enum AuditLevel {
  Audit = 'audit',
  NoAudit = 'noAudit',
}
```

#### `document-type.enum.ts`
Defines types of identification documents supported in the system:

```typescript
export enum UserDocumentTypes {
  CitizenshipCard = 'c.c',       // Cedula de ciudadania
  IdentityCard = 't.i',          // Tarjeta de identidad
  ForeignerIdentityCard = 'c.e', // Cedula de extranjeria
  Nit = 'nit',                   // NIT
  DiplomaticCard = 'c.d',        // Carnet diplomatico
  Passport = 'p.a',              // Pasaporte
  SpecialPermissionToStay = 'p.e.p', // Permiso especial de permanencia
  TemporaryProtectionPermit = 'p.p.t', // Permiso de protección temporal
  SafeConduct = 's.c',           // Salvoconducto
}
```

#### `person-type.enum.ts`
Defines types of persons in the system:

```typescript
export enum PersonTypes {
  Natural = 'natural',
  Legal = 'legal',
}
```

#### `type-file.enum.ts`
Defines file types supported by the application:

```typescript
export enum TypeFile {
  txt = 'TXT',
  docx = 'DOCX',
  xlsx = 'XLSX',
  pptx = 'PPTX',
  pdf = 'PDF',
  jpg = 'JPG',
  png = 'PNG',
  // ... and many more
}
```

**Usage Example for Enumerations:**
```typescript
import { ApplicationState } from 'src/common/enum/application-state.enum';
import { UserDocumentTypes } from 'src/common/enum/document-type.enum';

@Injectable()
export class ApplicationService {
  validateApplication(state: ApplicationState, documentType: UserDocumentTypes): boolean {
    if (state === ApplicationState.Pending && documentType === UserDocumentTypes.CitizenshipCard) {
      // Specific validation logic
      return true;
    }
    return false;
  }
}
```

### **Functions (`src/common/functions/`)**

#### `clean-underscore.interceptor.ts`
An interceptor that processes response data by:
1. Trimming string values
2. Removing special characters ()
3. Removing underscore prefixes and suffixes from property names

**Usage Example:**
```typescript
import { TrimAndRenameInterceptor } from 'src/common/functions/clean-underscore.interceptor';

@UseInterceptors(TrimAndRenameInterceptor)
@Controller('api')
export class SomeController {}
```

#### `contextualized-throw.ts`
Provides a custom exception class (`ContextualizedException`) that includes context information when throwing exceptions:

```typescript
export class ContextualizedException extends HttpException {
  constructor(
    public readonly context: IContext,
    public readonly exception: HttpStatus,
    public readonly level: AuditLevel,
    message: string,
  ) {
    super(message, exception);
  }
}
```

**Usage Example:**
```typescript
import { ContextualizedException } from 'src/common/functions/contextualized-throw';
import { AuditLevel } from 'src/common/enum/audit-level.enum';

throw new ContextualizedException(
  context,
  HttpStatus.BAD_REQUEST,
  AuditLevel.Audit,
  'Invalid input data'
);
```

#### `handle-event.function.ts`
A generic utility function for handling asynchronous events with proper type checking:

```typescript
export const handleEvent = async <T, D>(
  eventEmitter: EventEmitter2, 
  eventName: string, 
  payload: D, 
  type?: { new () }
): Promise<T>
```

**Usage Example:**
```typescript
import { handleEvent } from 'src/common/functions/handle-event.function';

// Handling a user creation event
const user = await handleEvent<User, CreateUserDto>(
  this.eventEmitter,
  'user.created',
  createUserDto,
  User
);
```

#### `html.ts`
Provides functions for manipulating HTML content:

```typescript
export function replaceValuesSignElectronic(
  html: string, 
  replacements: Record<string, string>
): string
```

This function uses Cheerio to replace HTML content based on selectors and values.

**Usage Example:**
```typescript
import { replaceValuesSignElectronic } from 'src/common/functions/html';

const htmlTemplate = '<div id="name">Name</div><div id="date">Date</div>';
const replacements = {
  '#name': 'John Doe',
  '#date': '2023-04-05'
};

const finalHtml = replaceValuesSignElectronic(htmlTemplate, replacements);
// Result: '<div id="name">John Doe</div><div id="date">2023-04-05</div>'
```

#### `i18n-validation-pipe.ts`
A custom validation pipe that integrates with the i18n system for localized validation error messages:

```typescript
export class I18nValidation extends ValidationPipe
```

**Usage Example:**
```typescript
import { I18nValidation } from 'src/common/functions/i18n-validation-pipe';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useFactory: (i18n) => new I18nValidation(i18n),
      inject: [I18nService],
    },
  ],
})
export class AppModule {}
```

#### `index.ts`
Contains a collection of utility functions for string manipulation, code generation, and validation:

Key functions include:
- `nameof<T>`: Type-safe way to get property names
- `validateString`: Validates password strength
- `generateRandomCode`: Generates random codes with specific characteristics
- `calculateDigitVerification`: Calculates verification digits for identification numbers
- `joinNames`: Concatenates name components
- `generateConsecutive`: Generates consecutive identifiers
- `formatPrice`: Formats numbers as currency

**Usage Example:**
```typescript
import { validateString, generateRandomCode } from 'src/common/functions/index';

// Validate password strength
const isValid = validateString('P@ssw0rd123');

// Generate a random code
const code = generateRandomCode(context, 10);
```

#### `pdf-array-custom.ts`
A custom implementation for handling PDF arrays with extended functionality:

```typescript
export default class PDFArrayCustom
```

**Usage Example:**
```typescript
import PDFArrayCustom from 'src/common/functions/pdf-array-custom';

const pdfArray = PDFArrayCustom.withContext(context);
const clone = pdfArray.clone();
```

#### `replace-html.ts`
A function that replaces tokens in HTML content using a dictionary:

```typescript
export function replaceHtmlWithDictionary(
  html: string, 
  dictionary: IDictionary
): string
```

**Usage Example:**
```typescript
import { replaceHtmlWithDictionary } from 'src/common/functions/replace-html';
import { IDictionary } from 'src/common/interfaces/dictionary.interface';

const template = '<p>Hello [#NAME#], welcome to [#COMPANY#]!</p>';
const dictionary: IDictionary = {
  NAME: 'John',
  COMPANY: 'VUDEC'
};

const result = replaceHtmlWithDictionary(template, dictionary);
// Result: '<p>Hello John, welcome to VUDEC!</p>'
```

#### `sort-views.ts`
A topological sorting function for views with dependencies:

```typescript
export function sortViews(views: { name: string; dependsOn?: string[] }[]): string[]
```

**Usage Example:**
```typescript
import { sortViews } from 'src/common/functions/sort-views';

const views = [
  { name: 'view1', dependsOn: ['view2'] },
  { name: 'view2' },
  { name: 'view3', dependsOn: ['view1'] }
];

const sortedViews = sortViews(views);
// Result: ['view2', 'view1', 'view3']
```

#### `throw-exception-filter.ts`
A global exception filter that handles exceptions in both HTTP and GraphQL contexts:

```typescript
@Catch(HttpException)
export class ThrowExceptionFilter implements GqlExceptionFilter
```

**Usage Example:**
```typescript
import { ThrowExceptionFilter } from 'src/common/functions/throw-exception-filter';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: ThrowExceptionFilter,
    },
  ],
})
export class AppModule {}
```

### **Internationalization (i18n) (`src/common/i18n/`)**

#### **Core Files and Classes**

#### `translation.ts`
Core translation service with methods for localizing messages:

```typescript
export class Translations {
  public translateText(i18n: I18nContext, message: string, args: object)
  public guard(i18n: I18nContext, message: string, args: object)
}
```

#### **Constants Directory (`src/common/i18n/constants/`)**

#### `language.constants.ts`
Defines supported languages:

```typescript
export const language = Object.freeze({
  En: 'en',
  Es: 'es',
});
```

#### `spaces.constants.ts`
Defines i18n namespaces for different modules:

```typescript
export const I18N_SPACE = Object.freeze({
  Common: 'common',
  Certimail: 'certimail',
  Audit: 'audit',
  // ... and many more
});
```

#### **Decorators Directory (`src/common/i18n/decorators/`)**

#### `language.decorator.ts`
Interceptor that extracts and sets the language from request headers:

```typescript
@Injectable()
export class LanguageInterceptor implements NestInterceptor
```

#### **Functions Directory (`src/common/i18n/functions/`)**

#### `response.ts`
Utility for sending localized responses:

```typescript
export function sendResponse(
  context: IContext | ExecutionContext,
  space: string,
  path: string,
  args?: Record<string, string | number>,
  i18nService?: I18nService,
): string
```

#### **Language Files**

Directories `en/` and `es/` contain JSON files with translations for different modules:
- `user.json`
- `auth.json`
- `validation.json`
- `organization.json`
- And many others

**Usage Example for i18n:**
```typescript
import { Translations } from 'src/common/i18n/translation';
import { language } from 'src/common/i18n/constants/language.constants';
import { I18N_SPACE } from 'src/common/i18n/constants/spaces.constants';
import { sendResponse } from 'src/common/i18n/functions/response';

@Injectable()
export class UserService {
  constructor(private readonly translations: Translations) {}

  welcomeUser(context: IContext, username: string): string {
    return sendResponse(
      context,
      I18N_SPACE.User,
      'welcome',
      { username },
    );
  }
}
```

### **Interfaces (`src/common/interfaces/`)**

#### `dictionary.interface.ts`
Defines a key-value dictionary interface:

```typescript
export interface IDictionary {
  [key: string]: any;
}
```

#### `has-order-index.interface.ts`
Interface for entities that have an ordering index:

```typescript
export interface HasOrderIndex {
  orderIndex: string;
}
```

#### `has-parent-id.interface.ts`
Interface for entities with parent-child relationships:

```typescript
export interface HasParentId {
  parentId: string;
}
```

**Usage Example:**
```typescript
import { IDictionary } from 'src/common/interfaces/dictionary.interface';
import { HasOrderIndex } from 'src/common/interfaces/has-order-index.interface';
import { HasParentId } from 'src/common/interfaces/has-parent-id.interface';

export class MenuItem implements HasOrderIndex, HasParentId {
  id: string;
  name: string;
  parentId: string;
  orderIndex: string;
  
  metadata: IDictionary = {
    icon: 'home',
    isVisible: true,
  };
}
```

### **Report (`src/common/report/`)**

#### `dynamic-filter.ts`
Provides complex filtering functionality for report generation:

Key classes:
- `Filter`: Defines filter structure for report columns
- `ReportOptions`: Configuration for report columns
- `CellConfig`: Cell styling configuration
- `QueryBuilder`: Utility for building TypeORM queries from filter expressions

**Usage Example:**
```typescript
import { QueryBuilder, Filter } from 'src/common/report/dynamic-filter';

@Injectable()
export class ReportService {
  constructor(private readonly queryBuilder: QueryBuilder) {}

  async generateReport(filters: string, group?: string, sort?: string) {
    const fields: Filter[] = [
      {
        filterName: 'name',
        fieldName: 'user.name',
        dataType: 'string',
        canfilter: true,
        cangroup: true,
        canorder: true,
      },
      // More field definitions
    ];

    const qb = this.userRepository.createQueryBuilder('user');
    const enhancedQb = this.queryBuilder.BuildQB(qb, fields, filters, group, sort);
    return enhancedQb.getMany();
  }
}
```

### **Scalars (`src/common/scalars/`)**

#### `date.scalar.ts`
Custom GraphQL scalar type for handling dates with timezone support:

```typescript
@Scalar('DateTime', (type) => Date)
export class DateTimeScalar implements CustomScalar<string, Date>
```

**Usage Example:**
```typescript
import { DateTimeScalar } from 'src/common/scalars/date.scalar';

@Module({
  providers: [
    DateTimeScalar,
    // other providers
  ],
})
export class AppModule {}

// In a GraphQL schema
@ObjectType()
class Event {
  @Field(() => 'DateTime')
  createdAt: Date;
}
```

### **Types (`src/common/types/`)**

#### `filter.type.ts`
GraphQL input types for filtering operations:

```typescript
@InputType()
export class Filter {
  @Field(() => GraphQLJSONObject, { nullable: true })
  and?: Record<string, string>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  like?: Record<string, string>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  or?: Record<string, string[]>;
}
```

**Usage Example:**
```typescript
import { Filter } from 'src/common/types/filter.type';

@Resolver()
export class UserResolver {
  @Query(() => [User])
  async users(@Args('filter', { nullable: true }) filter?: Filter) {
    return this.userService.findAll(filter);
  }
}
```

### **Utils (`src/common/utils/`)**

#### `array.utils.ts`
Utilities for array manipulation:

```typescript
export function uniqueFilter(value, index, self) {
  return self.indexOf(value) === index;
}
```

#### `check-url.utils.ts`
Function to check if a URL is valid and accessible:

```typescript
export async function checkUrl(url: string): Promise<boolean>
```

#### `events.utils.ts`
Utilities for event handling:

```typescript
export class EventsUtils {
  static async callOne(eventEmitter: EventEmitter2, eventName: string, payload: any)
}
```

**Usage Example:**
```typescript
import { uniqueFilter } from 'src/common/utils/array.utils';
import { checkUrl } from 'src/common/utils/check-url.utils';
import { EventsUtils } from 'src/common/utils/events.utils';

// Filter unique values
const uniqueItems = ['a', 'b', 'a', 'c'].filter(uniqueFilter);
// Result: ['a', 'b', 'c']

// Check URL validity
const isValid = await checkUrl('https://example.com');

// Call event with response
const result = await EventsUtils.callOne(eventEmitter, 'user.created', userData);
```

## **Best Practices**

### **Using the Common Module**

1. **Import Specific Files**: Import only what you need to keep bundle sizes small
   ```typescript
   // Good
   import { DocumentType } from 'src/common/enum/document-type.enum';
   
   // Avoid
   import * as CommonEnums from 'src/common/enum';
   ```

2. **Extend Instead of Modify**: If you need to add functionality, extend existing utilities rather than modifying them
   ```typescript
   // src/your-module/extended-translations.ts
   import { Translations } from 'src/common/i18n/translation';
   
   export class ExtendedTranslations extends Translations {
     public translateCustomMessage(i18n, message, args) {
       // Custom implementation
     }
   }
   ```

3. **Leverage Existing Functionality**: Before creating new utilities, check if the Common module already provides what you need

4. **Consistent Error Handling**: Use the error handling patterns from the Common module:
   ```typescript
   import { ContextualizedException } from 'src/common/functions/contextualized-throw';
   import { AuditLevel } from 'src/common/enum/audit-level.enum';
   
   try {
     // Operation that might fail
   } catch (error) {
     throw new ContextualizedException(
       context, 
       HttpStatus.BAD_REQUEST,
       AuditLevel.Audit,
       'Operation failed'
     );
   }
   ```

5. **Internationalization**: Always use the i18n system for user-facing messages:
   ```typescript
   import { sendResponse } from 'src/common/i18n/functions/response';
   import { I18N_SPACE } from 'src/common/i18n/constants/spaces.constants';
   
   const message = sendResponse(context, I18N_SPACE.User, 'profile.updated');
   ```

### **Adding to the Common Module**

When adding new components to the Common Module, follow these guidelines:

1. **Proper Categorization**: Place your code in the appropriate subdirectory
2. **Documentation**: Include JSDoc comments for functions and classes
3. **Testing**: Ensure your additions are well-tested
4. **Naming Convention**: Use descriptive names that reflect the purpose
5. **Avoid Dependencies**: Minimize dependencies on other modules

## **Troubleshooting**

### **Common Issues**

#### Import Issues
**Problem**: "Cannot find module 'src/common/...' or its corresponding type declarations"
**Solution**: Ensure you're using the correct path. In NestJS, imports should typically use the path from the project root.

#### Type Errors
**Problem**: Type errors when using enums or interfaces
**Solution**: Make sure you're importing the correct types and using them according to their definitions.

#### i18n Errors
**Problem**: Missing translations
**Solution**: Check that the translation key exists in the appropriate language file and that you're using the correct path.

#### Validation Errors
**Problem**: Validation errors not displaying correctly
**Solution**: Ensure you're using the `I18nValidation` pipe and that your validation messages are properly defined in the i18n files.

#### Event Handling Errors
**Problem**: Event handlers not being called or returning errors
**Solution**: Verify that you're using the correct event name and that handlers are properly registered. Use the `handleEvent` function for type-safe event handling.

## **Conclusion**

The Common Module provides a robust foundation of shared components that help maintain consistency and reduce duplication across the VUDEC application. Understanding and properly utilizing these common utilities will help you write more maintainable, consistent, and error-free code.

As you develop new features, consider whether any of your utility code might be useful elsewhere in the application. If so, following the patterns established in the Common Module will help enhance the project's maintainability and reduce duplication. 