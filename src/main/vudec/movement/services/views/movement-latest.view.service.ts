import { Injectable } from '@nestjs/common';
import { CrudServiceStructure } from '../../../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { MovementLatestView } from '../../entity/views/movement-latest.view.entity';

export const serviceStructure = CrudServiceStructure({
  entityType: MovementLatestView,
});

@Injectable()
export class MovementLatestViewService extends CrudServiceFrom(serviceStructure) {}
