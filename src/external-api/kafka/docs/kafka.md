[Home](../../../../README.md) > [External API Module](../../docs/external-api.md) > [Kafka Module Documentation]

# **Kafka Module Documentation**

## **Introduction**

The Kafka module provides event-driven messaging capabilities to the VUDEC system, enabling asynchronous communication between different system components and with external systems. This documentation provides a comprehensive guide for developers who need to understand and work with the Kafka integration.

### **VUDEC Context**

VUDEC (Ventanilla Única de Desmaterialización de Estampillas) is a system designed for the comprehensive management of contract stamps (estampillas) that have been assessed and paid for each contract in an entity. The primary objective of VUDEC is to report these stamps to the SECOP system called SIGEC, complying with the regulatory framework established in "Article 13 of Law 2052 of 2020".

VUDEC automates all functions related to the management, reporting, adhesion, and payment of different contractual stamps, which are a type of documentary tax authorized by law. This system provides complete administration of contracts, including tracking the stamps associated with each contract and the different states that contracts go through during their lifecycle.

The Kafka module enhances this system by providing real-time event processing capabilities, enabling efficient communication between different components of the VUDEC system and with external systems. This is particularly important for processing high volumes of stamp-related transactions and ensuring data consistency across the platform.

## **Overview**

The Kafka module enables the VUDEC system to:

- Publish and subscribe to event messages across services
- Process contract and stamp-related events asynchronously
- Ensure reliable message delivery with configurable retries
- Scale horizontally to handle increased transaction loads
- Maintain an audit trail of system events
- Integrate with external systems through event streams

This event-driven approach enhances the system's responsiveness and resilience, particularly when handling complex workflows related to contract management and stamp processing.

The module follows a clean separation of concerns with dedicated services for producing and consuming messages, making it straightforward to implement event-driven patterns throughout the application.

## **Module Structure**

```
src/external-api/kafka/
├── service/                     # Kafka service implementations
│   ├── producer.service.ts      # Service for publishing messages
│   └── consumer.service.ts      # Service for subscribing to messages
├── docs/                        # Documentation files
│   └── kafka.md                 # This documentation file
└── kafka.module.ts              # Module definition
```

## **Core Components**

### **KafkaModule**

The `KafkaModule` class provides the entry point for Kafka functionality:

```typescript
@Global()
@Module({
  providers: [ProducerService, ConsumerService],
  exports: [ProducerService, ConsumerService],
})
export class KafkaModule {}
```

Key features:
- **Global Module**: Annotated with `@Global()` to make Kafka services available throughout the application
- **Provider Registration**: Registers `ProducerService` and `ConsumerService`
- **Exports**: Makes both services available to other modules without explicit imports

The module is conditionally loaded in the `ExternalApiModule` based on the `KAFKA` environment variable, allowing easy enablement or disablement of Kafka functionality:

```typescript
@Module({
  imports: [
    // ... other imports
    process.env.KAFKA === 'true' ? KafkaModule : null
  ].filter(Boolean),
})
export class ExternalApiModule {}
```

### **ProducerService**

The `ProducerService` handles publishing messages to Kafka topics:

```typescript
@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: ['192.168.10.54:9092'],
  });
  private readonly producer: Producer = this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
  }

  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }
}
```

Key features:
- **Lifecycle Management**: Implements `OnModuleInit` to establish connections on startup and `OnApplicationShutdown` to clean up resources
- **Client Configuration**: Configures the Kafka client with broker addresses
- **Producer Instance**: Creates and manages a Kafka producer instance
- **Simplified API**: Provides a clean interface for sending messages

### **ConsumerService**

The `ConsumerService` handles subscribing to and processing messages from Kafka topics:

```typescript
@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: ['192.168.10.54:9092'],
    ssl: true,
  });
  private readonly consumers: Consumer[] = [];

  async consume(
    topic: ConsumerSubscribeTopics,
    config: ConsumerRunConfig
  ) {
    const consumer = this.kafka.consumer({
      groupId: 'nestjs-kafka-consumer',
    });
    await consumer.connect();
    await consumer.subscribe(topic);
    await consumer.run(config);
    this.consumers.push(consumer);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
```

Key features:
- **Lifecycle Management**: Implements `OnApplicationShutdown` to clean up consumer resources
- **Client Configuration**: Configures the Kafka client with broker addresses and SSL settings
- **Consumer Tracking**: Maintains a list of active consumers for proper cleanup
- **Consumer Group**: Uses a consistent consumer group ID for load balancing
- **Flexible Subscription**: Supports subscription to various topics with custom configurations

## **Usage Examples**

### **Producing Messages**

To publish messages to a Kafka topic, inject and use the `ProducerService`:

```typescript
@Injectable()
export class MyService {
  constructor(private readonly producerService: ProducerService) {}

  async sendNotification(userId: string, message: string) {
    try {
      await this.producerService.produce({
        topic: 'user-notifications',
        messages: [
          {
            key: userId,
            value: JSON.stringify({
              userId,
              message,
              timestamp: new Date().toISOString(),
            }),
          },
        ],
      });
      
      console.log(`Notification sent to user ${userId}`);
    } catch (error) {
      console.error('Error publishing message to Kafka:', error.message);
      throw error;
    }
  }
}
```

### **Consuming Messages**

To subscribe to a Kafka topic and process messages, inject and use the `ConsumerService`:

```typescript
@Injectable()
export class NotificationProcessor implements OnModuleInit {
  constructor(private readonly consumerService: ConsumerService) {}

  async onModuleInit() {
    await this.consumerService.consume(
      { topics: ['user-notifications'] },
      {
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const value = message.value.toString();
            const notification = JSON.parse(value);
            
            console.log(`Processing notification for user ${notification.userId}`);
            
            // Process the notification
            await this.processNotification(notification);
          } catch (error) {
            console.error('Error processing message:', error.message);
          }
        },
      }
    );
  }

  private async processNotification(notification: any) {
    // Implementation of notification processing
  }
}
```

## **Configuration**

### **Environment Variables**

The Kafka module can be configured using environment variables:

- `KAFKA`: Set to 'true' to enable the Kafka module
- `KAFKA_BROKERS`: Comma-separated list of Kafka broker addresses (optional, defaults to configuration in the service)
- `KAFKA_SSL`: Set to 'true' to enable SSL for Kafka connections (optional, defaults to configuration in the service)

### **Custom Configuration**

For more advanced configuration, you can modify the service implementations:

```typescript
// Custom producer configuration
private readonly kafka = new Kafka({
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  ssl: process.env.KAFKA_SSL === 'true',
  sasl: process.env.KAFKA_SASL === 'true' ? {
    mechanism: 'plain',
    username: process.env.KAFKA_USERNAME,
    password: process.env.KAFKA_PASSWORD,
  } : undefined,
});
```

## **Best Practices**

### **Message Structure**

Define consistent message structures for your topics:

```typescript
interface KafkaMessage<T> {
  messageId: string;       // Unique identifier
  messageType: string;     // Type of message for routing
  timestamp: string;       // ISO timestamp
  payload: T;              // Strongly typed payload
  metadata?: {             // Optional metadata
    source: string;
    correlationId?: string;
  };
}
```

### **Error Handling**

Implement robust error handling for both producing and consuming:

```typescript
// For producers
try {
  await producerService.produce({
    topic: 'my-topic',
    messages: [{ value: JSON.stringify(message) }],
  });
} catch (error) {
  logger.error('Failed to produce message', { 
    error: error.message, 
    topic: 'my-topic' 
  });
  // Consider retry logic or fallback mechanism
}

// For consumers
{
  eachMessage: async ({ topic, partition, message }) => {
    try {
      // Process message
    } catch (error) {
      logger.error('Failed to process message', { 
        error: error.message,
        topic,
        partition,
        offset: message.offset
      });
      // Consider dead-letter queue or retry logic
    }
  }
}
```

### **Topic Naming Conventions**

Follow consistent naming conventions for Kafka topics:

- Use hyphen-separated lowercase names (e.g., `user-notifications`)
- Include domain or service prefix (e.g., `auth-user-created`)
- Use verbs in past tense for events (e.g., `document-uploaded`)

### **Consumer Groups**

Use meaningful consumer group IDs to manage message distribution:

```typescript
const consumer = this.kafka.consumer({
  groupId: `vudec-${serviceName}-consumer`,
});
```

## **Troubleshooting**

### **Common Issues**

#### Connection Issues
**Problem**: Unable to connect to Kafka brokers
**Solution**:
- Verify broker addresses in the configuration
- Check network connectivity to Kafka brokers
- Ensure firewall rules allow connections to Kafka (typically port 9092)
- Verify SSL configuration if enabled

#### Message Processing Errors
**Problem**: Errors when processing messages
**Solution**:
- Implement proper error handling in message processors
- Validate message structure before processing
- Consider a dead-letter queue for failed messages
- Add comprehensive logging for debugging

#### Performance Issues
**Problem**: Slow message processing or high latency
**Solution**:
- Increase consumer parallelism
- Optimize message processing logic
- Consider message batching for producers
- Review Kafka broker configuration

## **Security Considerations**

### **Authentication and Encryption**

For production environments, consider enabling security features:

```typescript
const kafka = new Kafka({
  brokers: ['kafka-broker:9092'],
  ssl: true,
  sasl: {
    mechanism: 'plain', // or 'scram-sha-256', 'scram-sha-512'
    username: 'user',
    password: 'password',
  },
});
```

### **Sensitive Data**

Be cautious about storing sensitive data in Kafka messages:

- Remove sensitive information or encrypt it
- Use authentication and authorization for topic access
- Consider message expiration for topics with sensitive data
- Implement audit logging for message access

## **Extending the Module**

### **Adding Custom Middleware**

You can extend the module with custom middleware for cross-cutting concerns:

```typescript
const runConfig: ConsumerRunConfig = {
  eachMessage: async (payload) => {
    // Add timing metrics
    const start = Date.now();
    try {
      // Call the actual message handler
      await messageHandler(payload);
    } finally {
      const duration = Date.now() - start;
      metrics.recordMessageProcessingTime(duration);
    }
  },
};
```

### **Creating a Dead-Letter Queue**

Implement a dead-letter queue for failed message processing:

```typescript
async function processWithDeadLetterQueue(message, processor) {
  try {
    await processor(message);
  } catch (error) {
    await producerService.produce({
      topic: 'dead-letter-queue',
      messages: [{
        value: JSON.stringify({
          originalMessage: message,
          error: error.message,
          timestamp: new Date().toISOString(),
          retryCount: (message.retryCount || 0) + 1,
        }),
      }],
    });
  }
}
```

## **Conclusion**

The Kafka module provides a powerful integration with Apache Kafka, enabling event-driven architectures within the VUDEC system. By following the patterns and best practices outlined in this documentation, developers can effectively leverage Kafka for asynchronous messaging, event processing, and system integration.

Understanding this module is essential for building scalable, resilient, and loosely coupled components in the application. The event-driven approach facilitated by Kafka can significantly improve the system's ability to handle complex workflows and high-throughput scenarios. 