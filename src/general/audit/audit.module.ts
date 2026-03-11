import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Audit } from './entities/audit.entity';
import { AuditResolver } from './resolvers/audit.resolver';
import { AuditService } from './services/audit.service';

//Colocar este modulo global para que pueda ser llamado en cualquier modulo
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Audit])],
  providers: [AuditResolver, AuditService],
  exports: [AuditService],
})
export class AuditModule {} //Importar esto en su modulo padre
