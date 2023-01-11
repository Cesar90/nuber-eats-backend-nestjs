import { CONFIG_OPTIONS } from './../jwt/jwt.constants';
import { Test } from '@nestjs/testing';
import got from "got"
import { MailService } from './mail.service';
import * as FormData from 'form-data'

jest.mock("got")
// jest.mock("form-data", () => {
//   return {
//     append: jest.fn()
//   }
// })
jest.mock("form-data")

const TEST_DOMAIN = 'test-domain'

describe('MailService', () => {
  let service: MailService

  beforeEach(async() => {
    const module = await Test.createTestingModule({
      providers: [MailService,{
        provide: CONFIG_OPTIONS,
        useValue: {
          apiKey:'test-apiKey',
          domain:TEST_DOMAIN,
          fromEmail: 'test-fromEmail'
        }
      }]
    }).compile()
    service = module.get<MailService>(MailService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  // it.todo('sendVerificationEmail')
  describe('sendVerificationEmail', () => {
    it("should call sendEmail", () => {
      const sendVerificationEmailArgs = {
        email: 'email',
        code: 'code'
      }
      
      jest.spyOn(service, 'sendEmail').mockImplementation(async() => {
        return true
      })
      // jest.spyOn(service, 'sendEmail')
      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code
      )

      // service.sendEmail = jest.fn()
      
      expect(service.sendEmail).toHaveBeenCalledTimes(1)
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email', 
        'verify-email2',
        [
          {key: 'v:code', value: sendVerificationEmailArgs.code},
          {key: 'v:username', value: sendVerificationEmailArgs.email}
        ]
      )
    })
  })
  
  // it.todo('sendEmail')
  describe('sendEmail', () => {
    it('sends email', async() => {
      const ok = await service.sendEmail('','',[{ key:"one",value: '1' }])
      const formSpy = jest.spyOn(FormData.prototype,"append")
      expect(formSpy).toHaveBeenCalled()
      expect(got.post).toHaveBeenCalledTimes(1)
      expect(got.post).toHaveBeenCalledWith(
        // expect.any(String)
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`, 
        expect.any(Object))
      expect(ok).toEqual(true)
    })
    it('fails on error', async() => {
      jest.spyOn(got, "post").mockImplementation(() => {
        throw new Error()
      })
      const ok = await service.sendEmail('','',[])
      expect(ok).toEqual(false)
    })
  })
})