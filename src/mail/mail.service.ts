import got from "got"
import * as FormData from 'form-data'
import { MailModuleOptions, EmailVar } from './mail.interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions
  ){
    // this.sendEmail("Verify Your Email", "verify-email2",[
    //   { key: 'v:code', value: "test" },
    //   { key: 'v:username', value: "test" }
    // ])
    // this.sendEmail('testing','test')
  }

  async sendEmail(subject: string, template: string, emailVar: EmailVar[]): Promise<boolean>{
    const form = new FormData()
    form.append("from",`Cesar from Nuber Eats <mailgun@${this.options.domain}>`)
    form.append("to",`ccordero.007@gmail.com`)
    form.append("subject", subject)
    form.append("template", template)
    // form.append("v:code","asdafds")
    // form.append("v:username", "cesar!!!")
    emailVar.forEach(eVar => form.append(eVar.key, eVar.value))

    try {
      await got.post(
        `https://api.mailgun.net/v3/${this.options.domain}/messages`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `api:${this.options.apiKey}`,
            ).toString('base64')}`,
          },
          body: form,
        },
      );
      return true
    } catch (error) {
      return false
    }
  }

  sendVerificationEmail(email: string, code:string){
    this.sendEmail("Verify Your Email", "verify-email2",[
      { key: 'v:code', value: code },
      { key: 'v:username', value: email }
    ])
  }
}
