import { BadRequestException, Inject, Injectable, LoggerService } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { findUserByIdEvent } from '../../../security/users/constants/events.constants';
import { User } from '../../../security/users/entities/user.entity';
import { CreateAuditInput } from '../dto/inputs/create-audit.input';
import { UpdateAuditInput } from '../dto/inputs/update-audit.input';
import { Audit } from '../entities/audit.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: Audit,
  createInputType: CreateAuditInput,
  updateInputType: UpdateAuditInput,
});

@Injectable()
export class AuditService extends CrudServiceFrom(serviceStructure) {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async beforeMutation(context: IContext, repository: Repository<Audit>, entity: Audit, input: CreateAuditInput | UpdateAuditInput): Promise<Audit> {
    if (context.user?.id) {
      const [user] = await this.eventEmitter.emitAsync(findUserByIdEvent, {
        context,
        id: context.user.id,
        orFail: false,
      });

      if (!(user instanceof User)) {
        this.logger.warn('No se obtuvo usuario válido para audit:', user);
      } else {
        entity.user = user;
      }
    }

    if (context.ip) {
      entity.ip = context.ip;
    }

    return entity;
  }

  async beforeCreate(context: IContext, repository: Repository<Audit>, entity: Audit, createInput: CreateAuditInput): Promise<void> {
    entity = await this.beforeMutation(context, repository, entity, createInput);
  }

  async afterMutation(context: IContext, repository: Repository<Audit>, entity: Audit, input: CreateAuditInput | UpdateAuditInput): Promise<Audit> {
    if (input.userId) {
      const [user] = await this.eventEmitter.emitAsync(findUserByIdEvent, {
        context,
        id: context.user.id,
        orFail: false,
      });

      if (!(user instanceof User)) {
        this.logger.warn('No se obtuvo usuario válido en afterMutation:', user);
      } else {
        entity.user = user;
      }
    }

    this.logger.log('*** AUDIT END ***');

    return entity;
  }

  async afterCreate(context: IContext, repository: Repository<Audit>, entity: Audit, createInput: CreateAuditInput): Promise<void> {
    entity = await this.afterMutation(context, repository, entity, createInput);
  }

  async afterUpdate(context: IContext, repository: Repository<Audit>, entity: Audit, updateInput: UpdateAuditInput): Promise<void> {
    entity = await this.afterMutation(context, repository, entity, updateInput);
  }
}
