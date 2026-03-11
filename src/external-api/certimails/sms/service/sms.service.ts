import { Injectable } from '@nestjs/common';
import { SmsManagerService } from './sms.manager.service';
import { ISmsRequest, ISmsResponse } from '../interface/sms.interface';
import { SmsArgs, SmsRecipient } from '../dto/args/sms.args';
import { BodyType } from '../../email/interface/email.enum';
import { ProfileService } from '../../profile/services/profile.service';
import { IDictionary } from '../../../../common/interfaces/dictionary.interface';
import { User } from '../../../../security/users/entities/user.entity';

@Injectable()
export class SmsService {
  constructor(
    private readonly smsManagerService: SmsManagerService,
    private readonly profileService: ProfileService,
  ) {}

  async createSms(smsArgs: SmsArgs): Promise<ISmsResponse> {
    const dictionary: IDictionary = smsArgs.metadata ? JSON.parse(smsArgs.metadata) : {};
    const profile = await this.profileService.findOne({ user: undefined }, smsArgs.profileId, true);
    const message = await this.__replaceHtmlWithDictionary(smsArgs.message, dictionary);

    const smsStructure: ISmsRequest = {
      ApiKey: profile.externalId,
      FromEmail: profile.email,
      FromEmailName: profile.firstName + ' ' + profile.lastName,
      BodyType: BodyType.Custom,
      Subject: smsArgs.subject,
      Message: message,
      Destinatario: {
        SmsDesTel: smsArgs.recipient.phone,
        SmsDesNom: smsArgs.recipient.name,
        SmsDesApe: smsArgs.recipient.lastName,
        SmsDesEmail: smsArgs.recipient.email,
      },
      SmsDosPasos: smsArgs.twoSteps,
      LotGUID: smsArgs.notificationGroupId,
      LotName: smsArgs.notificationGroupName,
    };
    return await this.smsManagerService.sendSms(smsStructure);
  }

  getDestinataryByUser(user: User): SmsRecipient {
    return {
      phone: user.phoneNumber,
      email: user.email,
      name: user.name,
    };
  }

  private async __replaceHtmlWithDictionary(html: string, dictionary: IDictionary) {
    let modifiedHtml = html;

    for (const key in dictionary) {
      if (dictionary.hasOwnProperty(key)) {
        const value = dictionary[key];
        const tokenPattern = new RegExp(`\\[#${key}#\\]`, 'gi');
        modifiedHtml = modifiedHtml.replace(tokenPattern, value);
      }
    }

    return modifiedHtml as string;
  }
}
