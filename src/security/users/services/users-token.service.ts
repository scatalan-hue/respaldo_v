import { Injectable } from '@nestjs/common';
import { FindUserArgs } from '../dto/args/find-users.args';
import { UpdateUserKeyInput } from '../dto/inputs/update-user-key.input';
import { User } from '../entities/user.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { findOneUserTokenEvent, registerUserTokenEvent } from '../constants/events.constants';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceFrom } from '../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { CrudServiceStructure } from '../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { UserToken } from '../entities/user-token.entity';
import { CreateSecUserTokenInput } from '../dto/inputs/secuser-token/create-sec-user-token.inputs';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';

export const serviceStructure = CrudServiceStructure({
  entityType: UserToken,
  createInputType: CreateSecUserTokenInput,
  updateInputType: UpdateUserKeyInput,
  findArgsType: FindUserArgs,
});

@Injectable()
export class UsersTokenService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly usersService: UsersService) {
    super();
  }
  async beforeCreate(context: IContext, repository: Repository<UserToken>, entity: UserToken, createInput: CreateSecUserTokenInput): Promise<void> {
    if (createInput.userId) {
      const user = await this.usersService.findOne(context, createInput.userId, false);
      entity.user = user;
    }
  }
  async checkToken(context: IContext, token: string, user: User): Promise<boolean> {
    const repository = this.getRepository(context);
    return true;
  }

  @OnEvent(registerUserTokenEvent)
  async onregisterSecUserToken({
    context,
    createSecUserTokenInput,
  }: {
    context: IContext;
    createSecUserTokenInput: CreateSecUserTokenInput;
  }): Promise<UserToken> {
    return await this.create(context, createSecUserTokenInput);
  }

  @OnEvent(findOneUserTokenEvent)
  async onFindOneUserTokenEvent({ context, id }: { context: IContext; id: string }): Promise<UserToken> {
    return this.findOne(context, id, true);
  }
}
