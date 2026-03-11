[Home](../../../../README.md) > [External API Module](../../docs/external-api.md) > [Certimails Module Documentation]

# **Certimails Module Documentation**

## **Introduction**

The Certimails module provides a robust integration with external certified communication services, enabling the VUDEC system to send secure, certified emails, SMS notifications, and other communication types. This documentation provides a comprehensive guide for developers who need to understand and work with the Certimails module.

### **VUDEC Context**

VUDEC (Ventanilla Única de Desmaterialización de Estampillas) is a system designed for the comprehensive management of contract stamps (estampillas) that have been assessed and paid for each contract in an entity. The primary objective of VUDEC is to report these stamps to the SECOP system called SIGEC, complying with the regulatory framework established in "Article 13 of Law 2052 of 2020".

VUDEC automates all functions related to the management, reporting, adhesion, and payment of different contractual stamps, which are a type of documentary tax authorized by law. This system provides complete administration of contracts, including tracking the stamps associated with each contract and the different states that contracts go through during their lifecycle.

The Certimails module plays a crucial role in this system by providing the official communication channel for notifying users and stakeholders about contract status changes, payment requirements, and other critical information through certified electronic communications.

## **Overview**

The Certimails module enables the VUDEC system to:

- Send certified emails with legally-recognized delivery proof
- Deliver SMS notifications for time-sensitive updates
- Generate and distribute electronic documents with digital signatures
- Track delivery and read status of communications
- Store communication history for audit and compliance purposes
- Provide templated communications for various system events

By providing certified communications, the module ensures that all stakeholders receive important notifications about contract and stamp status changes, while maintaining a legally-valid record of these communications.

## **Module Structure**

```
src/external-api/certimails/
├── email/                      # Email notification services
│   ├── email.module.ts         # Email module definition
│   ├── email.service.ts        # Core email service
│   └── dto/                    # Email-related DTOs
├── sms/                        # SMS notification services
│   ├── sms.module.ts           # SMS module definition
│   ├── sms.service.ts          # Core SMS service
│   └── dto/                    # SMS-related DTOs
├── wss/                        # WebSocket communication
│   ├── wss.module.ts           # WebSocket module definition
│   ├── wss.gateway.ts          # WebSocket gateway implementation
│   └── wss.service.ts          # WebSocket service
├── profile/                    # User profile management
│   ├── profile.module.ts       # Profile module definition
│   ├── profile.service.ts      # Profile service
│   └── dto/                    # Profile-related DTOs
├── docs/                       # Documentation files
│   └── certimails.md           # This documentation file
└── certimails.module.ts        # Main module definition
```

## **Core Components**

### **CertimailsModule**

The `CertimailsModule` serves as the container for all notification and communication services:

```typescript
@Module({
  imports: [EmailModule, SmsModule, WssModule, ProfileModule],
})
export class CertimailsModule {}
```

This module integrates four specialized submodules:
- **EmailModule**: For handling email notifications
- **SmsModule**: For sending SMS messages
- **WssModule**: For WebSocket communications
- **ProfileModule**: For managing user notification preferences

### **Email Module**

The Email module manages certified email delivery and tracking:

```typescript
@Module({
  imports: [HttpModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
```

#### **EmailService**

```typescript
@Injectable()
export class EmailService {
  constructor(private readonly httpService: HttpService) {}

  async sendEmail(emailRequest: SendEmailDto): Promise<EmailResponseDto> {
    const emailProvider = process.env.EMAIL_PROVIDER;
    
    try {
      // Send email through the appropriate provider
      if (emailProvider === 'certmail') {
        return this.sendCertifiedEmail(emailRequest);
      } else {
        return this.sendRegularEmail(emailRequest);
      }
    } catch (error) {
      this.handleEmailError(error);
    }
  }

  private async sendCertifiedEmail(emailRequest: SendEmailDto): Promise<EmailResponseDto> {
    const apiUrl = process.env.CERTMAIL_API_URL;
    const apiKey = process.env.CERTMAIL_API_KEY;
    
    // Format request for certified email provider
    const formattedRequest = this.formatCertifiedEmailRequest(emailRequest);
    
    // Send request to certified email provider
    const response = await firstValueFrom(
      this.httpService.post(apiUrl, formattedRequest, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      })
    );
    
    return this.parseCertifiedEmailResponse(response.data);
  }

  private async sendRegularEmail(emailRequest: SendEmailDto): Promise<EmailResponseDto> {
    // Implementation for regular email delivery
  }

  private handleEmailError(error: any): never {
    // Error handling logic
    throw new InternalServerErrorException('Failed to send email');
  }
}
```

The `EmailService` provides:
- Support for multiple email providers
- Certified email delivery with legal validity
- Tracking of email delivery and opens
- Template-based email composition

### **SMS Module**

The SMS module manages text message delivery to mobile devices:

```typescript
@Module({
  imports: [HttpModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
```

#### **SmsService**

```typescript
@Injectable()
export class SmsService {
  constructor(private readonly httpService: HttpService) {}

  async sendSms(smsRequest: SendSmsDto): Promise<SmsResponseDto> {
    const smsProvider = process.env.SMS_PROVIDER;
    
    try {
      // Send SMS through the appropriate provider
      if (smsProvider === 'twillio') {
        return this.sendTwillioSms(smsRequest);
      } else {
        return this.sendDefaultSms(smsRequest);
      }
    } catch (error) {
      this.handleSmsError(error);
    }
  }

  private async sendTwillioSms(smsRequest: SendSmsDto): Promise<SmsResponseDto> {
    const apiUrl = process.env.TWILLIO_API_URL;
    const accountSid = process.env.TWILLIO_ACCOUNT_SID;
    const authToken = process.env.TWILLIO_AUTH_TOKEN;
    
    // Format request for Twillio
    const formattedRequest = this.formatTwillioRequest(smsRequest);
    
    // Send request to Twillio
    const response = await firstValueFrom(
      this.httpService.post(apiUrl, formattedRequest, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
        }
      })
    );
    
    return this.parseTwillioResponse(response.data);
  }

  private async sendDefaultSms(smsRequest: SendSmsDto): Promise<SmsResponseDto> {
    // Implementation for default SMS provider
  }

  private handleSmsError(error: any): never {
    // Error handling logic
    throw new InternalServerErrorException('Failed to send SMS');
  }
}
```

The `SmsService` provides:
- Support for multiple SMS providers
- Message delivery status tracking
- Template-based message composition
- International SMS delivery

### **WebSocket Module**

The WebSocket module enables real-time bidirectional communication:

```typescript
@Module({
  providers: [WssGateway, WssService],
  exports: [WssService],
})
export class WssModule {}
```

#### **WssGateway**

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WssGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private logger = new Logger('WssGateway');
  
  constructor(private readonly wssService: WssService) {}
  
  afterInit(server: Server) {
    this.wssService.setServer(server);
    this.logger.log('WebSocket Server Initialized');
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
  
  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  
  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { event: 'join-room', data: { success: true, room } };
  }
  
  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
    return { event: 'leave-room', data: { success: true, room } };
  }
}
```

#### **WssService**

```typescript
@Injectable()
export class WssService {
  private server: Server;
  
  setServer(server: Server) {
    this.server = server;
  }
  
  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
  
  emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, data);
  }
  
  emitToUser(userId: string, event: string, data: any) {
    this.emitToRoom(`user:${userId}`, event, data);
  }
}
```

The WebSocket module provides:
- Real-time bidirectional communication
- Room-based messaging for group notifications
- User-specific notification channels
- Event-based message routing

### **Profile Module**

The Profile module manages user notification preferences:

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([UserProfile])],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
```

#### **ProfileService**

```typescript
@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}
  
  async getUserProfile(userId: string): Promise<UserProfile> {
    return await this.userProfileRepository.findOne({ where: { userId } });
  }
  
  async updateNotificationPreferences(
    userId: string, 
    preferences: NotificationPreferencesDto
  ): Promise<UserProfile> {
    let profile = await this.getUserProfile(userId);
    
    if (!profile) {
      profile = new UserProfile();
      profile.userId = userId;
    }
    
    profile.emailNotifications = preferences.emailNotifications;
    profile.smsNotifications = preferences.smsNotifications;
    profile.pushNotifications = preferences.pushNotifications;
    
    return await this.userProfileRepository.save(profile);
  }
  
  async shouldNotifyByEmail(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    return profile?.emailNotifications ?? true; // Default to true if no profile
  }
  
  async shouldNotifyBySms(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    return profile?.smsNotifications ?? false; // Default to false if no profile
  }
  
  async shouldNotifyByPush(userId: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);
    return profile?.pushNotifications ?? true; // Default to true if no profile
  }
}
```

The Profile module provides:
- User notification preference management
- Channel-specific opt-in/opt-out settings
- Default notification settings
- User profile data storage

## **Usage Examples**

### **Sending a Certified Email**

```typescript
@Injectable()
export class NotificationService {
  constructor(private readonly emailService: EmailService) {}

  async sendContractConfirmation(userId: string, contractId: string, email: string): Promise<void> {
    const emailRequest: SendEmailDto = {
      to: email,
      subject: 'Contract Confirmation',
      template: 'contract-confirmation',
      templateData: {
        userId,
        contractId,
        confirmationDate: new Date().toISOString(),
      },
      attachments: [
        {
          filename: 'contract.pdf',
          path: `/path/to/contracts/${contractId}.pdf`,
          contentType: 'application/pdf',
        },
      ],
      certified: true, // Send as certified email
      trackOpens: true,
      trackLinks: true,
    };

    try {
      const response = await this.emailService.sendEmail(emailRequest);
      
      // Log the certified email for legal records
      this.logCertifiedEmail(userId, contractId, response.messageId);
    } catch (error) {
      // Handle error
      this.logger.error(`Failed to send contract confirmation email: ${error.message}`);
      throw error;
    }
  }

  private async logCertifiedEmail(userId: string, contractId: string, messageId: string): Promise<void> {
    // Implementation to log the certified email
  }
}
```

### **Sending SMS Notifications**

```typescript
@Injectable()
export class AlertService {
  constructor(private readonly smsService: SmsService) {}

  async sendPaymentReminder(userId: string, phoneNumber: string, amount: number, dueDate: string): Promise<void> {
    const smsRequest: SendSmsDto = {
      to: phoneNumber,
      template: 'payment-reminder',
      templateData: {
        amount: amount.toFixed(2),
        dueDate,
      },
      trackDelivery: true,
    };

    try {
      const response = await this.smsService.sendSms(smsRequest);
      
      // Log the SMS notification
      this.logSmsNotification(userId, response.messageId);
    } catch (error) {
      // Handle error
      this.logger.error(`Failed to send payment reminder SMS: ${error.message}`);
      throw error;
    }
  }

  private async logSmsNotification(userId: string, messageId: string): Promise<void> {
    // Implementation to log the SMS notification
  }
}
```

### **Using WebSockets for Real-Time Updates**

```typescript
@Injectable()
export class ApplicationStatusService {
  constructor(private readonly wssService: WssService) {}

  async updateApplicationStatus(applicationId: string, status: string, userId: string): Promise<void> {
    // Update the application status in the database
    await this.applicationRepository.update(applicationId, { status });
    
    // Notify the user in real-time
    this.wssService.emitToUser(
      userId,
      'application-status-updated',
      {
        applicationId,
        status,
        updatedAt: new Date().toISOString(),
      }
    );
    
    // Also notify admins
    this.wssService.emitToRoom(
      'admins',
      'application-status-updated',
      {
        applicationId,
        status,
        userId,
        updatedAt: new Date().toISOString(),
      }
    );
  }
}
```

### **Managing User Notification Preferences**

```typescript
@Injectable()
export class UserSettingsService {
  constructor(private readonly profileService: ProfileService) {}

  async updateNotificationSettings(userId: string, settings: NotificationSettingsDto): Promise<UserProfile> {
    const preferences: NotificationPreferencesDto = {
      emailNotifications: settings.receiveEmails,
      smsNotifications: settings.receiveSms,
      pushNotifications: settings.receivePushNotifications,
    };
    
    return await this.profileService.updateNotificationPreferences(userId, preferences);
  }

  async sendNotification(userId: string, notification: NotificationDto): Promise<void> {
    // Check user preferences and send notifications accordingly
    const [emailEnabled, smsEnabled, pushEnabled] = await Promise.all([
      this.profileService.shouldNotifyByEmail(userId),
      this.profileService.shouldNotifyBySms(userId),
      this.profileService.shouldNotifyByPush(userId),
    ]);
    
    const promises = [];
    
    if (emailEnabled && notification.email) {
      promises.push(this.emailService.sendEmail(notification.email));
    }
    
    if (smsEnabled && notification.sms) {
      promises.push(this.smsService.sendSms(notification.sms));
    }
    
    if (pushEnabled && notification.push) {
      promises.push(this.wssService.emitToUser(userId, 'notification', notification.push));
    }
    
    await Promise.all(promises);
  }
}
```

## **Configuration**

### **Environment Variables**

The Certimails module relies on the following environment variables:

```
# Email Configuration
EMAIL_PROVIDER=certmail
CERTMAIL_API_URL=https://api.certmail.com/v1
CERTMAIL_API_KEY=your-api-key

# SMS Configuration
SMS_PROVIDER=twillio
TWILLIO_API_URL=https://api.twillio.com/2010-04-01
TWILLIO_ACCOUNT_SID=your-account-sid
TWILLIO_AUTH_TOKEN=your-auth-token

# WebSocket Configuration
WSS_PORT=3001
WSS_PATH=/socket.io
```

These variables should be configured in the application's environment based on the deployment context.

## **Error Handling**

The Certimails module implements comprehensive error handling across all communication channels:

### **Email Error Handling**

```typescript
private handleEmailError(error: any): never {
  if (error.response) {
    // API error with response
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 400) {
      throw new BadRequestException(`Invalid email request: ${data.message}`);
    } else if (status === 401 || status === 403) {
      throw new UnauthorizedException(`Authentication error with email provider: ${data.message}`);
    } else {
      throw new InternalServerErrorException(`Email provider error: ${data.message}`);
    }
  } else if (error.request) {
    // No response received
    throw new ServiceUnavailableException('Email provider is unavailable');
  } else {
    // Request setup error
    throw new InternalServerErrorException(`Email configuration error: ${error.message}`);
  }
}
```

### **SMS Error Handling**

```typescript
private handleSmsError(error: any): never {
  // Similar to email error handling with SMS-specific logic
}
```

### **WebSocket Error Handling**

```typescript
// In WssGateway
@SubscribeMessage('error')
handleError(client: Socket, error: any) {
  this.logger.error(`WebSocket error from client ${client.id}: ${error.message}`);
  return { event: 'error', data: { message: 'Error processed' } };
}

// In WssService
emitToUser(userId: string, event: string, data: any) {
  try {
    this.emitToRoom(`user:${userId}`, event, data);
  } catch (error) {
    this.logger.error(`Error emitting to user ${userId}: ${error.message}`);
    // Fallback mechanism could be implemented here
  }
}
```

## **Security Considerations**

### **Email Security**

- **Content Encryption**: Emails are encrypted during transmission
- **Attachment Scanning**: Attachments are scanned for malware
- **Anti-Phishing**: Links in emails are checked against phishing databases
- **Legal Compliance**: Certified emails comply with legal requirements for official communications

### **SMS Security**

- **Phone Verification**: Phone numbers are verified before sending SMS
- **Rate Limiting**: SMS sending is rate-limited to prevent abuse
- **Content Filtering**: SMS content is filtered for inappropriate material
- **Number Masking**: Phone numbers can be masked for privacy

### **WebSocket Security**

- **Authentication**: WebSocket connections require authentication
- **Room Authorization**: Users can only join authorized rooms
- **Message Validation**: All messages are validated before processing
- **Rate Limiting**: Message sending is rate-limited to prevent flooding

### **Profile Data Security**

- **Data Encryption**: Profile data is encrypted at rest
- **Access Control**: Strict access controls for profile data
- **Audit Logging**: All profile changes are logged for audit purposes
- **Data Minimization**: Only necessary data is collected and stored

## **Troubleshooting**

### **Common Issues**

#### Email Delivery Issues
**Problem**: Emails are not being delivered or are marked as spam
**Solution**:
- Verify that the email provider API key is correct
- Check that the sender domain has proper SPF, DKIM, and DMARC records
- Ensure email content complies with anti-spam guidelines
- Verify that recipient email addresses are valid

#### SMS Delivery Issues
**Problem**: SMS messages are not being delivered
**Solution**:
- Verify that the SMS provider credentials are correct
- Check that phone numbers are in the correct international format
- Ensure SMS content complies with carrier guidelines
- Verify that the recipient has not opted out of SMS

#### WebSocket Connection Issues
**Problem**: WebSocket connections are failing or dropping
**Solution**:
- Check network connectivity between clients and server
- Verify that WebSocket port is open in firewalls
- Ensure client authentication is properly configured
- Monitor server resources for overloads affecting connections

#### Notification Preference Issues
**Problem**: User notification preferences are not being respected
**Solution**:
- Verify that the profile service is properly queried before sending notifications
- Check that default preferences are correctly applied for new users
- Ensure preference updates are properly saved to the database
- Verify that the notification service checks all relevant preferences

## **Best Practices**

1. **Respect User Preferences**: Always check user notification preferences before sending messages
2. **Multi-Channel Strategy**: Use multiple channels for critical notifications to ensure delivery
3. **Templating**: Use standardized templates for consistent messaging
4. **Retry Mechanism**: Implement retry logic for failed notifications
5. **Delivery Tracking**: Track and log all notification delivery statuses
6. **Testing**: Test notifications across different devices and clients
7. **Feedback Mechanism**: Provide a way for users to report notification issues

### **Example Notification Strategy**

```typescript
async function sendCriticalNotification(userId: string, message: string): Promise<void> {
  const user = await userService.getUserById(userId);
  const channels = [];
  
  // Check preferences and add enabled channels
  if (await profileService.shouldNotifyByEmail(userId)) {
    channels.push(notificationChannel.EMAIL);
  }
  
  if (await profileService.shouldNotifyBySms(userId)) {
    channels.push(notificationChannel.SMS);
  }
  
  if (await profileService.shouldNotifyByPush(userId)) {
    channels.push(notificationChannel.PUSH);
  }
  
  // If no channels are enabled, use a fallback (email)
  if (channels.length === 0) {
    channels.push(notificationChannel.EMAIL);
  }
  
  // Send notifications in parallel
  await Promise.all(
    channels.map(channel => sendNotification(userId, message, channel))
  );
  
  // Log the notification
  await logNotification(userId, message, channels);
}
```

## **Conclusion**

The Certimails module provides a robust and flexible framework for managing all types of notifications and communications within the VUDEC system. By integrating email, SMS, WebSocket, and user profile management, it ensures that users receive timely and appropriate notifications through their preferred channels.

Understanding this module is essential for implementing features that require user communication, ensuring regulatory compliance for official notifications, and creating a responsive user experience. The multi-channel approach and preference management make the system adaptable to various user needs and communication scenarios.