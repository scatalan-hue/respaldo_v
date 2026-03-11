import { registerEnumType } from "@nestjs/graphql";

export enum AuditLevel {
    Audit = 'audit',
    NoAudit = 'noAudit',
}

registerEnumType(AuditLevel,{name:'AuditLevel'})