import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment-timezone';
import { I18N_SPACE } from '../../../common/i18n/constants/spaces.constants';
import { sendResponse } from '../../../common/i18n/functions/response';
import { IContext } from '../../../patterns/crud-pattern/interfaces/context.interface';
import { CrudServiceStructure } from '../../../patterns/crud-pattern/interfaces/structures/crud-service-structure.interface';
import { CrudServiceFrom } from '../../../patterns/crud-pattern/mixins/crud-service.mixin';
import { signInWithUserEvent } from '../../auth/constants/events.constants';
import { User } from '../../users/entities/user.entity';
import { checkCodeEvent, createCodeEvent, registerCodeEvent } from '../constants/events.constants';
import { FindUserArgs } from '../dto/args/find-users.args';
import { UserKeyExtraArgs } from '../dto/args/user-key.args';
import { CreateUserKeyInput } from '../dto/inputs/create-user-key.input';
import { UpdateUserKeyInput } from '../dto/inputs/update-user-key.input';
import { UserKey } from '../entities/user-key.entity';
import { AuthResultToken } from '../types/user-key.type';

export const serviceStructure = CrudServiceStructure({
  entityType: UserKey,
  createInputType: CreateUserKeyInput,
  updateInputType: UpdateUserKeyInput,
  findArgsType: FindUserArgs,
});

@Injectable()
export class UsersKeyService extends CrudServiceFrom(serviceStructure) {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  private readonly I18N_SPACE = I18N_SPACE.User;

  async registerCode(context: IContext, code: string, user: User, origin: string, credentialId?: string, dateExpiration?: Date): Promise<boolean> {
    let dateExp: Date = new Date(moment.tz(process.env.TZ).add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss'));

    let codeRecord = await this.findOneBy(context, {
      where: {
        user: { id: user.id },
        origin,
      },
    });

    if (!codeRecord) {
      await this.create(context, {
        code,
        expirationCode: dateExpiration || dateExp,
        user,
        origin,
        credentialId,
      });
    } else {
      codeRecord.code = code;
      codeRecord.expirationCode = dateExpiration || dateExp;

      await this.update(context, codeRecord?.id, codeRecord);
    }

    return true;
  }

  async checkCode(context: IContext, code: string, user: User, origin: string): Promise<boolean> {
    let getRecord = await this.findOneBy(context, {
      where: {
        code,
        user: { id: user.id },
        origin,
      },
    });

    if (!getRecord) return false;

    const { expirationCode } = getRecord;

    const now = new Date(moment.tz(process.env.TZ).format('YYYY-MM-DDTHH:mm:ss'));

    const expirationMoment = expirationCode;

    if (now > expirationMoment) return false;

    return true;
  }

  async authByCode(context: IContext, code: string): Promise<AuthResultToken> {
    let getRecord = await this.findOneBy(context, {
      where: {
        code,
      },
    });

    if (!getRecord) throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'authByCode.getRecord'));

    if (getRecord?.expirationCode) {
      const { expirationCode } = getRecord;

      const now = new Date(moment.tz(process.env.TZ).format('YYYY-MM-DDTHH:mm:ss'));

      const expirationMoment = expirationCode;

      if (now > expirationMoment) throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'authByCode.expired'));
    }
    const user = await getRecord.user;

    const [response] = await this.eventEmitter.emitAsync(signInWithUserEvent, {
      context,
      userId: user.id,
    });

    if (!response) throw new BadRequestException(sendResponse(context, this.I18N_SPACE, 'authByCode.error'));

    return {
      credentialId: getRecord.credentialId,
      organizationId: getRecord.organizationId,
      productId: getRecord.productId,
      taxpayerId: getRecord.taxpayerId,
      JwtToken: response,
    };
  }

  async createAuthCode(context: IContext, user: User, origin: string, args?: UserKeyExtraArgs, expirable?: boolean): Promise<UserKey> {
    const dateExp = moment.tz(process.env.TZ).add(1, 'hour').format('YYYY-MM-DDTHH:mm:ss');

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dateExp.toString(), salt);
    const cleanedToken = hash.replace(/[^a-zA-Z0-9-_~]/g, '');
    const codeRecord = await this.create(context, {
      code: cleanedToken,
      expirationCode: expirable ? new Date(dateExp) : null,
      user,
      origin,
      credentialId: args?.credentialId,
      organizationId: args?.organizationId,
      productId: args?.productId,
      taxpayerId: args?.taxpayerId,
    });

    return codeRecord;
  }

  @OnEvent(registerCodeEvent)
  async onRegisterCode({
    context,
    code,
    user,
    origin,
    credentialId,
    dateExp,
  }: {
    context: IContext;
    code: string;
    user: User;
    origin: string;
    credentialId?: string;
    dateExp?: Date;
  }): Promise<boolean> {
    return await this.registerCode(context, code, user, origin, credentialId, dateExp);
  }

  @OnEvent(checkCodeEvent)
  async onCheckCode({ context, code, user, origin }: { context: IContext; code: string; user: User; origin: string }): Promise<boolean> {
    return this.checkCode(context, code, user, origin);
  }

  @OnEvent(createCodeEvent)
  async onCreateAuthCode(context: IContext, user: User, origin: string, args?: UserKeyExtraArgs, expirable: boolean = true): Promise<UserKey> {
    return await this.createAuthCode(context, user, origin, args, expirable);
  }
}
