[Home](../../../../../README.md) > [System Modules Documentation](../../../../docs/modules.md) > [Security Module Documentation](../../../docs/security.md) > [Functionality Module Documentation]

# 📘 Functionality Module — Technical Documentation

This module manages application functionalities (permissions, endpoints, operations) in a NestJS project. Each functionality can be linked to roles, enabling role-based access control throughout the system.

It supports:
- A TypeORM-based entity for persistence
- GraphQL CRUD operations via auto-resolver
- REST endpoint for retrieving functionalities by role
- Event-driven handler for modular integration
- Strict typing through DTOs, interfaces, and GraphQL types

---

## 📂 Module Structure

```
functionality/
├── constants/
├── controllers/
├── dto/
│   ├── events/
│   └── inputs/
├── entities/
├── events/
├── functions/
├── interfaces/
├── resolvers/
├── services/
├── types/
├── utils/
└── functionality.module.ts
```

---

## 🧩 Module Definition — `functionality.module.ts`

```ts
@Module({
  imports: [],
  controllers: [FunctionalityController],
  providers: [FunctionalityService, FunctionalityResolver, FunctionalityServiceEventHandler],
})
export class FunctionalityModule {}
```

- Registers REST + GraphQL layers.
- Event handler enables reactive use cases.
- No dynamic module imports are used here.

---

## 🧠 Entity — `functionality.entity.ts`

```ts
@Entity('sec_functionality')
@ObjectType()
export class Functionality extends CrudEntity {
  @Column()
  @Field()
  name: string;

  @Column()
  @Field()
  path: string;

  @Column()
  @Field()
  method: string;

  @Column()
  @Field()
  tag: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  description?: string;
}
```

| Field        | Type     | Description                     |
|--------------|----------|---------------------------------|
| `name`       | string   | Name of the functionality       |
| `path`       | string   | API path                        |
| `method`     | string   | HTTP method (GET, POST, etc.)   |
| `tag`        | string   | Category tag                    |
| `description`| string?  | Optional description            |

---

## 📥 Input DTOs

### `create-functionality.input.ts`

```ts
@InputType()
export class CreateFunctionalityInput {
  @Field() @IsString() name: string;
  @Field() @IsString() path: string;
  @Field() @IsString() method: string;
  @Field() @IsString() tag: string;
  @Field({ nullable: true }) @IsString() @IsOptional() description?: string;
}
```

### `update-functionality.input.ts`

```ts
@InputType()
export class UpdateFunctionalityInput extends PartialType(CreateFunctionalityInput) {
  @Field(() => ID) @IsUUID() id: string;
}
```

### `functionality-description.input.ts`

```ts
@InputType()
export class FunctionalityDescriptionInput {
  @Field(() => ID) @IsUUID() id: string;
  @Field() @IsString() description: string;
}
```

---

## 🔧 Service — `functionality.service.ts`

```ts
@Injectable()
export class FunctionalityService extends CrudServiceFrom(serviceStructure) {
  constructor(
    private readonly eventEmitter: EventEmitter2,
  ) {
    super();
  }

  async loadEntities(context: IContext, parent: any, roleId: string, validateRole: boolean) {
    // ... existing code ...
  }

  async functionalitiesDescriptionByPermission(context: IContext, functionalityDescriptionInput: FunctionalityDescriptionInput): Promise<Functionality> {
    // ... existing code ...
  }

  async synchronizeFunctionalities(context: IContext, child?: FunctionalityModel, parent?: Functionality): Promise<string> {
    // ... existing code ...
  }

  async findAllFunctionalities(context: IContext): Promise<Functionality> {
    // ... existing code ...
  }

  async functionalitiesByRole({ context, role }: FunctionalitiesByRoleEventInput): Promise<Functionality[]> {
    // ... existing code ...
  }

  async getFunctionalityBy({ context, options }: any): Promise<Functionality> {
    // ... existing code ...
  }

  @OnEvent('getFunctionalityByEvent')
  async onGetFunctionalityBy(input: any): Promise<Functionality> {
    // ... existing code ...
  }
}
```

- **`loadEntities(context: IContext, parent: any, roleId: string, validateRole: boolean)`**:
  - Carga las entidades hijas de una funcionalidad, validando roles si es necesario.
  - **Parameters**:
    - `context`: Contexto de la operación.
    - `parent`: Entidad padre de la cual se cargarán los hijos.
    - `roleId`: ID del rol para validar.
    - `validateRole`: Booleano que indica si se debe validar el rol.
  - **Return Type**: `Promise<void>`

- **`functionalitiesDescriptionByPermission(context: IContext, functionalityDescriptionInput: FunctionalityDescriptionInput): Promise<Functionality>`**:
  - Obtiene la descripción de una funcionalidad basada en permisos.
  - **Parameters**:
    - `context`: Contexto de la operación.
    - `functionalityDescriptionInput`: Input que contiene la clave de la funcionalidad.
  - **Return Type**: `Promise<Functionality>`

- **`synchronizeFunctionalities(context: IContext, child?: FunctionalityModel, parent?: Functionality): Promise<string>`**:
  - Sincroniza las funcionalidades, creando o actualizando según sea necesario.
  - **Parameters**:
    - `context`: Contexto de la operación.
    - `child`: Modelo de funcionalidad hijo.
    - `parent`: Entidad funcionalidad padre.
  - **Return Type**: `Promise<string>`

- **`findAllFunctionalities(context: IContext): Promise<Functionality>`**:
  - Encuentra todas las funcionalidades disponibles.
  - **Parameters**:
    - `context`: Contexto de la operación.
  - **Return Type**: `Promise<Functionality>`

- **`functionalitiesByRole({ context, role }: FunctionalitiesByRoleEventInput): Promise<Functionality[]>`**:
  - Obtiene las funcionalidades asociadas a un rol específico.
  - **Parameters**:
    - `context`: Contexto de la operación.
    - `role`: Rol para el cual se buscan las funcionalidades.
  - **Return Type**: `Promise<Functionality[]>`

- **`getFunctionalityBy({ context, options }: any): Promise<Functionality>`**:
  - Obtiene una funcionalidad basada en opciones específicas.
  - **Parameters**:
    - `context`: Contexto de la operación.
    - `options`: Opciones de búsqueda.
  - **Return Type**: `Promise<Functionality>`

### Event Emitters or Listeners

- **@OnEvent('getFunctionalityByEvent')**
  - **Description**: Escucha el evento `getFunctionalityByEvent` para obtener una funcionalidad.
  - **Handler**: `onGetFunctionalityBy(input: any): Promise<Functionality>`

### Error Handling
- Utiliza `NotFoundException` para manejar casos donde no se encuentra una funcionalidad.

### Example Usage in Code
```typescript
const functionalityService = new FunctionalityService(eventEmitter);
const functionalities = await functionalityService.findAllFunctionalities(context);
```

---

## 📡 Resolver — `functionality.resolver.ts`

```ts
@Resolver(() => Functionality)
export class FunctionalityResolver extends CrudResolverFrom(resolverStructure) {}
```

Auto-generates the following GraphQL operations:

| Operation                | Type     | Access   |
|--------------------------|----------|----------|
| `createFunctionality`    | Mutation | Admin    |
| `updateFunctionality`    | Mutation | Admin    |
| `removeFunctionality`    | Mutation | Admin    |
| `functionality(id)`      | Query    | Public   |
| `functionalities()`      | Query    | Public   |

There are no custom `@ResolveField()` or middleware decorators.

---

## 🌐 Controller — `functionality.controller.ts`

```ts
@Controller('functionalities')
@ApiTags('Functionality')
export class FunctionalityController {
  constructor(private readonly service: FunctionalityService) {}

  @Get()
  functionalities() {
    return this.service.findAllFunctionalities({ user: undefined });
  }
}
```

| Method | Route | Description |
|--------|-------|-------------|
| GET    | `/functionalities` | Returns all functionalities |

Este es el **único** método REST definido en el controlador, y se utiliza para obtener todas las funcionalidades disponibles.

---

## 📣 Events — `functionality.service.event-handler.ts`

```ts
@OnEvent(findFunctionalitiesByRole)
async findByRole({ context, roleId }) {
  return this.functionalityService.findByRole(context, roleId);
}
```

This listens to an internal event `findFunctionalitiesByRole`.

### `events.constants.ts`

```ts
export const findFunctionalitiesByRole = 'findFunctionalitiesByRole';
```

---

## 💡 Event DTO — `functionalities-by-role.event.ts`

```ts
export class FunctionalitiesByRoleEvent {
  context: IContext;
  roleId: string;
}
```

---

## 🧩 Interface — `functionality.service.interface.ts`

```ts
export interface IFunctionalityService {
  findByRole(context: IContext, roleId: string): Promise<Functionality[]>;
}
```

Used for typing and mocking the service.

---

## 🧰 Utilities — `functionality.utils.ts`

```ts
export function formatPath(path: string): string {
  return String(path || "").trim().toLowerCase();
}
```

Standard utility for consistent route formatting.

---

## 🔄 Function — `load-entities.function.ts`

```ts
export function loadEntities() {
  return [Functionality];
}
```

Used to dynamically register entities in app setup.

---

## ✅ Final Summary

The Functionality module is simple, declarative, and modular. It uses:

- **GraphQL + REST APIs**
- **DTO-based validation**
- **Entity-driven persistence**
- **Internal events for flexibility**
- **Minimal boilerplate via factories**

It is designed to manage features and permissions that are linkable to roles for RBAC systems.

---
