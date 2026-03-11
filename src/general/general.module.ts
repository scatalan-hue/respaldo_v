import { Module } from '@nestjs/common';
import { AuditModule } from './audit/audit.module';
import { BaseModule } from './base/base.module';
import { CityModule } from './city/city.module';
import { CountryModule } from './country/country.module';
import { DepartmentModule } from './department/department.module';
import { DocumentsModule } from './documents/documents.module';
import { DocumentTypeModule } from './documentType/documentType.module';
import { FilesModule } from './files/files.module';
import { NotificationConfigModule } from './notifications/notification-config/notification-config.module';
import { NotificationGroupModule } from './notifications/notification-group/notification-group.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ServerModule } from './server/server.module';
import { TemplateModule } from './template/template.module';
import { WebserviceLogModule } from './webservice-log/webservice-log.module';

@Module({
  imports: [
    FilesModule,
    NotificationsModule,
    NotificationConfigModule,
    NotificationGroupModule,
    CityModule,
    DepartmentModule,
    DocumentTypeModule,
    CountryModule,
    ScheduleModule,
    TemplateModule,
    ServerModule,
    BaseModule,
    AuditModule,
    DocumentsModule,
    WebserviceLogModule
  ],
})
export class GeneralModule {}
