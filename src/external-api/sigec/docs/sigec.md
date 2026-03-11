[Home](../../../../README.md) > [External API Module](../../docs/external-api.md) > [SIGEC Module Documentation]

# **SIGEC Module Documentation**

## **Introduction**

The SIGEC (Sistema de Información de Gestión de Estampillas Contractuales) module provides integration capabilities between the VUDEC system and Colombia's Contractual Stamps Management Information System. This documentation provides a comprehensive guide for developers who need to understand and work with the SIGEC integration module.

### **VUDEC Context**

VUDEC (Ventanilla Única de Desmaterialización de Estampillas) is a system designed for the comprehensive management of contract stamps (estampillas) that have been assessed and paid for each contract in an entity. The primary objective of VUDEC is to report these stamps to the SECOP system called SIGEC, complying with the regulatory framework established in "Article 13 of Law 2052 of 2020".

VUDEC automates all functions related to the management, reporting, adhesion, and payment of different contractual stamps, which are a type of documentary tax authorized by law. This system provides complete administration of contracts, including tracking the stamps associated with each contract and the different states that contracts go through during their lifecycle.

The SIGEC module is particularly critical as it implements the core integration with the governmental system that fulfills the regulatory requirements.

## **Overview**

The SIGEC module enables the VUDEC system to:

- Register and report contracts to Colombia's Contractual Stamps Management System
- Report stamp payments and their association with contracts
- Update contract statuses as they progress through their lifecycle
- Query contract information from the SIGEC system
- Submit amendments and liquidations for contracts

This integration is essential for regulatory compliance, ensuring that all contractual stamps are properly reported to the Colombian government's official system.

## **Module Structure**

```
src/external-api/sigec/
├── services/                    # Business logic and API communication
│   ├── sigec.service.ts         # Event handlers and business logic
│   └── sigec.manager.service.ts # Direct API communication
├── dto/                         # Data Transfer Objects
│   ├── requests/                # Request DTOs
│   └── responses/               # Response DTOs
├── enums/                       # Type definitions
│   └── sigec-events-type.enum.ts # Event type definitions
├── docs/                        # Documentation files
│   └── sigec.md                 # This documentation file
└── sigec.module.ts              # Module definition
```

## **Core Components**

### **SigecModule**

The `SigecModule` serves as the entry point for the SIGEC integration functionality:

```typescript
@Module({
  imports: [HttpModule],
  providers: [SigecService, SigecManager],
})
export class SigecModule {}
```

Key components:
- **HttpModule**: Imported to enable HTTP requests to the SIGEC API
- **SigecService**: Provider for event handling and business logic
- **SigecManager**: Provider for direct API communication

### **SigecService**

The service layer handles events and orchestrates operations with SIGEC:

```typescript
@Injectable()
export class SigecService {
  constructor(
    private readonly sigecManager: SigecManager,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.eventEmitter.emit(SigecEvents.ServiceReady);
  }

  @OnEvent(SigecEvents.ReportContract)
  async handleReportContract(data: ReportContractRequest): Promise<ReportContractResponse> {
    return await this.sigecManager.reportContract(data);
  }

  @OnEvent(SigecEvents.RegisterLiquidation)
  async handleRegisterLiquidation(data: RegisterLiquidationRequest): Promise<RegisterLiquidationResponse> {
    return await this.sigecManager.registerLiquidation(data);
  }

  @OnEvent(SigecEvents.RegisterPayment)
  async handleRegisterPayment(data: RegisterPaymentRequest): Promise<RegisterPaymentResponse> {
    return await this.sigecManager.registerPayment(data);
  }
}
```

Key features:
- **Event-Driven Architecture**: Uses `@OnEvent()` decorators to handle specific SIGEC operations
- **Service Ready Notification**: Emits a `ServiceReady` event when initialized
- **Delegation Pattern**: Delegates API operations to the `SigecManager` service
- **Type Safety**: Uses strongly typed request and response DTOs

### **SigecManager**

The manager service handles direct communication with the SIGEC API:

```typescript
@Injectable()
export class SigecManager {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(private readonly httpService: HttpService) {
    this.baseUrl = process.env.NODE_ENV === 'prod' 
      ? process.env.SIGEC_URL 
      : process.env.SIGEC_TEST_URL;
      
    this.token = process.env.NODE_ENV === 'prod'
      ? process.env.SIGEC_TOKEN
      : process.env.SIGEC_TEST_TOKEN;
  }

  async reportContract(data: ReportContractRequest): Promise<ReportContractResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/reportContract`,
          data,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            }
          }
        )
      );
      
      return response.data as ReportContractResponse;
    } catch (error) {
      this.handleApiError('Error reporting contract to SIGEC', error);
    }
  }

  async registerLiquidation(data: RegisterLiquidationRequest): Promise<RegisterLiquidationResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/registerLiquidation`,
          data,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            }
          }
        )
      );
      
      return response.data as RegisterLiquidationResponse;
    } catch (error) {
      this.handleApiError('Error registering liquidation in SIGEC', error);
    }
  }

  async registerPayment(data: RegisterPaymentRequest): Promise<RegisterPaymentResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/registerPayment`,
          data,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.token}`
            }
          }
        )
      );
      
      return response.data as RegisterPaymentResponse;
    } catch (error) {
      this.handleApiError('Error registering payment in SIGEC', error);
    }
  }

  private handleApiError(message: string, error: any): never {
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message;
    
    throw new HttpException(
      `${message}: ${errorMessage}`,
      status
    );
  }
}
```

Key features:
- **Environment-Aware Configuration**: Uses different URLs and tokens for production and test environments
- **HTTP Communication**: Uses `HttpService` to make API requests
- **Authentication**: Includes authorization headers with API token
- **Error Handling**: Comprehensive error handling with meaningful error messages
- **Response Typing**: Strongly typed responses for type safety

### **Event Types**

The module defines event types to trigger SIGEC operations:

```typescript
export enum SigecEvents {
  ServiceReady = 'sigec.service.ready',
  ReportContract = 'sigec.reportContract',
  RegisterLiquidation = 'sigec.registerLiquidation',
  RegisterPayment = 'sigec.registerPayment',
}
```

These events form the communication interface between the VUDEC system and the SIGEC integration.

### **Data Transfer Objects (DTOs)**

The module defines several DTOs to represent SIGEC data structures:

#### Request DTOs

```typescript
export class ReportContractRequest {
  @IsString()
  contractNumber: string;

  @IsString()
  contractorId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsNumber()
  contractValue: number;

  @IsString()
  contractDescription: string;
}

export class RegisterLiquidationRequest {
  @IsString()
  contractNumber: string;

  @IsDateString()
  liquidationDate: string;

  @IsNumber()
  finalValue: number;

  @IsString()
  liquidationObservations: string;
}

export class RegisterPaymentRequest {
  @IsString()
  contractNumber: string;

  @IsDateString()
  paymentDate: string;

  @IsNumber()
  paymentValue: number;

  @IsString()
  paymentReference: string;
}
```

#### Response DTOs

```typescript
export class BaseResponse {
  @IsBoolean()
  success: boolean;

  @IsString()
  message: string;
}

export class ReportContractResponse extends BaseResponse {
  @IsString()
  contractId: string;
}

export class RegisterLiquidationResponse extends BaseResponse {
  @IsString()
  liquidationId: string;
}

export class RegisterPaymentResponse extends BaseResponse {
  @IsString()
  paymentId: string;
}
```

These DTOs provide type safety and validation for SIGEC API interactions.

## **Integration Process**

### **Reporting a Contract**

The process for reporting a contract to SIGEC follows these steps:

1. **Event Emission**: An application component emits the `ReportContract` event with contract data
2. **Event Handling**: The `SigecService` receives the event and delegates to the manager
3. **API Communication**: The `SigecManager` sends the data to SIGEC via HTTP
4. **Response Processing**: The response is converted to a strongly typed DTO and returned
5. **Error Handling**: Any errors are caught, transformed, and thrown

```typescript
// Example of reporting a contract
@Injectable()
export class ContractService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async createContract(contractData: CreateContractDto): Promise<Contract> {
    // Create the contract in the local database
    const contract = await this.contractRepository.save(new Contract(contractData));
    
    // Report the contract to SIGEC
    try {
      const sigecReportData: ReportContractRequest = {
        contractNumber: contract.number,
        contractorId: contract.contractorId,
        startDate: contract.startDate.toISOString(),
        endDate: contract.endDate.toISOString(),
        contractValue: contract.value,
        contractDescription: contract.description,
      };
      
      const [response] = await this.eventEmitter.emitAsync(
        SigecEvents.ReportContract, 
        sigecReportData
      );
      
      // Update the contract with SIGEC reference
      contract.externalId = response.contractId;
      await this.contractRepository.save(contract);
      
      return contract;
    } catch (error) {
      // Handle the error appropriately
      this.logger.error(`Failed to report contract ${contract.id} to SIGEC: ${error.message}`);
      
      // You might want to flag the contract for retry
      contract.sigecSyncStatus = 'FAILED';
      contract.sigecSyncError = error.message;
      await this.contractRepository.save(contract);
      
      throw new InternalServerErrorException('Failed to report contract to SIGEC');
    }
  }
}
```

### **Registering a Liquidation**

Similarly, for registering a liquidation:

```typescript
// Example of registering a liquidation
async liquidateContract(contractId: string, liquidationData: LiquidationDto): Promise<Liquidation> {
  const contract = await this.contractRepository.findOneOrFail(contractId);
  
  // Create the liquidation in the local database
  const liquidation = await this.liquidationRepository.save(new Liquidation({
    ...liquidationData,
    contract,
  }));
  
  // Register the liquidation in SIGEC
  try {
    const sigecLiquidationData: RegisterLiquidationRequest = {
      contractNumber: contract.number,
      liquidationDate: liquidation.date.toISOString(),
      finalValue: liquidation.finalValue,
      liquidationObservations: liquidation.observations,
    };
    
    const [response] = await this.eventEmitter.emitAsync(
      SigecEvents.RegisterLiquidation, 
      sigecLiquidationData
    );
    
    // Update the liquidation with SIGEC reference
    liquidation.externalId = response.liquidationId;
    await this.liquidationRepository.save(liquidation);
    
    return liquidation;
  } catch (error) {
    // Handle the error appropriately
    // ...
  }
}
```

### **Registering a Payment**

And for registering a payment:

```typescript
// Example of registering a payment
async registerPayment(contractId: string, paymentData: PaymentDto): Promise<Payment> {
  const contract = await this.contractRepository.findOneOrFail(contractId);
  
  // Create the payment in the local database
  const payment = await this.paymentRepository.save(new Payment({
    ...paymentData,
    contract,
  }));
  
  // Register the payment in SIGEC
  try {
    const sigecPaymentData: RegisterPaymentRequest = {
      contractNumber: contract.number,
      paymentDate: payment.date.toISOString(),
      paymentValue: payment.amount,
      paymentReference: payment.reference,
    };
    
    const [response] = await this.eventEmitter.emitAsync(
      SigecEvents.RegisterPayment, 
      sigecPaymentData
    );
    
    // Update the payment with SIGEC reference
    payment.externalId = response.paymentId;
    await this.paymentRepository.save(payment);
    
    return payment;
  } catch (error) {
    // Handle the error appropriately
    // ...
  }
}
```

## **Configuration**

### **Environment Variables**

The SIGEC integration relies on the following environment variables:

```
# Production environment
SIGEC_URL=https://api.sigec.gov.co/v1
SIGEC_TOKEN=your-production-token

# Test environment
SIGEC_TEST_URL=https://test-api.sigec.gov.co/v1
SIGEC_TEST_TOKEN=your-test-token
```

These variables should be configured in the application's environment based on the deployment context.

## **Error Handling**

The SIGEC integration implements comprehensive error handling:

1. **API Communication Errors**: Handled when the SIGEC API is unreachable
2. **Authentication Errors**: Handled when the token is invalid
3. **Validation Errors**: Handled when the request data is invalid
4. **Business Logic Errors**: Handled when the SIGEC system rejects the operation

Example error handling:

```typescript
try {
  await this.eventEmitter.emitAsync(SigecEvents.ReportContract, contractData);
} catch (error) {
  if (error instanceof HttpException) {
    // Handle HTTP-specific errors
    logger.error('HTTP error communicating with SIGEC:', error.message);
  } else {
    // Handle other errors
    logger.error('Unexpected error with SIGEC integration:', error.message);
  }
  
  // Implement retry logic or fallback mechanisms
  await this.queueForRetry(SigecEvents.ReportContract, contractData);
}
```

## **Security Considerations**

### **API Authentication**

The SIGEC integration uses token-based authentication:

- Tokens are stored in environment variables, not in the codebase
- Different tokens are used for production and test environments
- All communications with SIGEC use HTTPS
- Tokens are included in the `Authorization` header with the `Bearer` prefix

### **Data Security**

All data exchanged with SIGEC should be treated as sensitive:

- Contract details may contain personal or financial information
- Avoid logging sensitive information
- Validate and sanitize all data before sending it to SIGEC
- Implement proper error handling to avoid exposing internal details

## **Troubleshooting**

### **Common Issues**

#### SIGEC Connection Issues
**Problem**: Unable to connect to SIGEC API
**Solution**:
- Verify that the URL in environment variables is correct
- Check network connectivity to the SIGEC system
- Ensure firewall rules allow outbound connections to SIGEC
- Validate SSL certificates if using HTTPS

#### Authentication Issues
**Problem**: Token-based authentication failures
**Solution**:
- Verify that the token in environment variables is correct
- Check if the token has expired
- Ensure the token has the necessary permissions
- Verify that the token is being included in the `Authorization` header

#### Data Validation Issues
**Problem**: SIGEC rejects the data due to validation errors
**Solution**:
- Verify that the data conforms to SIGEC's requirements
- Check date formats (ISO 8601 format is recommended)
- Ensure numeric values are within acceptable ranges
- Validate string lengths and character restrictions

## **Extending the Module**

### **Adding New Operations**

To add new operations to the SIGEC integration:

1. **Define Event**: Add the new event to the `SigecEvents` enum
   ```typescript
   export enum SigecEvents {
     // ... existing events
     NewOperation = 'sigec.newOperation',
   }
   ```

2. **Create DTOs**: Define request and response DTOs
   ```typescript
   export class NewOperationRequest {
     @IsString()
     someField: string;
     
     // Other fields
   }
   
   export class NewOperationResponse extends BaseResponse {
     @IsString()
     someResult: string;
     
     // Other fields
   }
   ```

3. **Add Manager Method**: Implement the API call in `SigecManager`
   ```typescript
   async newOperation(data: NewOperationRequest): Promise<NewOperationResponse> {
     try {
       const response = await firstValueFrom(
         this.httpService.post(
           `${this.baseUrl}/newOperation`,
           data,
           {
             headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${this.token}`
             }
           }
         )
       );
       
       return response.data as NewOperationResponse;
     } catch (error) {
       this.handleApiError('Error performing new operation in SIGEC', error);
     }
   }
   ```

4. **Add Event Handler**: Implement the handler in `SigecService`
   ```typescript
   @OnEvent(SigecEvents.NewOperation)
   async handleNewOperation(data: NewOperationRequest): Promise<NewOperationResponse> {
     return await this.sigecManager.newOperation(data);
   }
   ```

## **Best Practices**

1. **Event-Driven Architecture**: Use events for loose coupling between application components and the SIGEC integration
2. **Error Handling**: Implement comprehensive error handling for all SIGEC operations
3. **Retry Mechanism**: For critical operations, implement a retry mechanism with exponential backoff
4. **Idempotency**: Design operations to be idempotent to handle retry scenarios safely
5. **Logging**: Log all SIGEC interactions for audit and troubleshooting purposes
6. **Testing**: Create mock implementations for testing without calling the actual SIGEC API


## **Conclusion**

The SIGEC integration module provides a robust connection between the VUDEC system and Colombia's Public Employment Management System. By following the event-driven architecture and best practices outlined in this documentation, developers can effectively work with and extend the module to meet the system's integration needs.

Understanding this module is essential for implementing features that require interaction with the SIGEC system, such as contract reporting, liquidation registration, and payment processing. The event-driven approach enables loose coupling and flexible integration patterns, making the system more maintainable and resilient. 