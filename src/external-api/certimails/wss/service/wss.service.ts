import { Injectable } from '@nestjs/common';
import { WssManagerService } from './wss.manager.service';
import { ProfileService } from '../../profile/services/profile.service';
import { WssArgs, WssRecipient } from '../dto/args/wss.args';
import { IWssRequest, IWssResponse } from '../interface/wss.interface';
import { User } from '../../../../security/users/entities/user.entity';

@Injectable()
export class WssService {
  constructor(
    private readonly wssManagerService: WssManagerService,
    private readonly profileService: ProfileService,
  ) {}

  async createWss(wssArgs: WssArgs): Promise<IWssResponse> {
    const profile = await this.profileService.findOne({ user: undefined }, wssArgs.profileId, true);

    const wssStructure: IWssRequest = {
      ApiKey: profile.externalId,
      PersNom: wssArgs.recipient.name,
      PersNumDoc: wssArgs.recipient.document,
      Subject: wssArgs.subject,
      TelIndicativo: wssArgs.recipient.phonePrefix,
      TelNumber: wssArgs.recipient.phone,
      type: 'TemplateMessage',
      TemplateMessage: {
        guid: wssArgs.template.code,
        metadata: wssArgs.template.metadata,
      },
      WssDosPasos: wssArgs.twoSteps,
      LotGUID: wssArgs.notificationGroupId,
      LotName: wssArgs.notificationGroupName,
    };
    return await this.wssManagerService.sendWss(wssStructure);
  }

  getDestinataryByUser(user: User): WssRecipient {
    return {
      phone: user.phoneNumber,
      phonePrefix: '57',
      name: user.name,
      document: user.identificationNumber,
    };
  }
}
