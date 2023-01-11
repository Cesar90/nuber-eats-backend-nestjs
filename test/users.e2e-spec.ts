import { User } from './../src/users/entities/user.entity';
import { UsersRepository } from './../../../nestjszerotohero/nestjs-task-management/src/auth/users.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock("got", () => {
  return {
    post: jest.fn()
  }
})

const GRAPHQL_ENDPOINT = '/graphql'

const testUser = {
  email: "test@test.test",
  password: "123"
}

describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository:Repository<User>
  let jwtToken: string

  const baseTest = () => request(app.getHttpServer()).post(GRAPHQL_ENDPOINT);
  const publicTest = (query: string) => baseTest().send({ query });
  const privateTest = (query: string) =>
    baseTest()
      .set('X-JWT', jwtToken)
      .send({ query });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User))
    await app.init();
  });

  afterAll(async() => {
    await getConnection().dropDatabase()
    app.close()
  })

  // it.todo('createAccount')
  describe('createAccount', () => {
    // const EMAIL = "test@test.test"
    it('should create account', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation{
              createAccount(input:{
                email:"${testUser.email}",
                password: "${testUser.password}",
                role: Client
              }){
                ok
                error
              }
            }
          `
        })
        .expect(200)
        .expect(res => {
          // console.log(res.body.data.createAccount)
          expect(res.body.data.createAccount.ok).toBe(true)
          expect(res.body.data.createAccount.error).toBe(null)
        })
    })

    it('should fail if account already exists', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
            mutation{
              createAccount(input:{
                email:"${testUser.email}",
                password: "${testUser.password}",
                role: Client
              }){
                ok
                error
              }
            }
          `
        })
        .expect(200)
        .expect(res => {
          expect(res.body.data.createAccount.ok).toBe(false)
          expect(res.body.data.createAccount.error).toEqual(expect.any(String))
        })
    })
  })

  // it.todo('login')
  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation{
            login(input:{
              email:"${testUser.email}",
              password: "${testUser.password}",
            }){
              ok
              error
              token
            }
          }
          `
        })
        .expect(200)
        .expect(res => {
          
          const { body: { data : { login } } } = res
          expect(login.ok).toBe(true)
          expect(login.error).toBe(null)
          expect(login.token).toEqual(expect.any(String))
          jwtToken = login.token
        })
    })

    it('should not be able to login with correct credentials', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .send({
          query: `
          mutation{
            login(input:{
              email:"${testUser.email}",
              password: "xxx",
            }){
              ok
              error
              token
            }
          }
          `
        })
        .expect(200)
        .expect(res => {
          
          const { body: { data : { login } } } = res
          expect(login.ok).toBe(false)
          expect(login.error).toBe("Wrong password")
          expect(login.token).toBe(null)
        })
    })
  })

  // it.todo('userProfile')
  describe('userProfile', ()=>{
    let userId:number
    beforeEach(async() => {
      const [user] = await usersRepository.find()
      userId = user.id
    })
    it("should see a user's profile", ()=>{
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT',jwtToken)
        .send({
          query:`
          query{
            userProfile(userId:${userId}){
              ok
              error
              user{
                id
              }
            }
          }
          `
        })
        .expect(200)
        .expect(res => {
          const { body: { data: { userProfile: { ok, error, user: { id } } } } } = res
          expect(ok).toBe(true)
          expect(error).toBe(null)
          expect(id).toBe(userId)
        })
    })
    it('should not found a profile', () => {
      return request(app.getHttpServer())
        .post(GRAPHQL_ENDPOINT)
        .set('X-JWT',jwtToken)
        .send({
          query:`
          query{
            userProfile(userId:123){
              ok
              error
              user{
                id
              }
            }
          }
          `
        })
        .expect(200)
        .expect(res => {
          const { body: { data: { userProfile: { ok, error, user } } } } = res
          expect(ok).toBe(false)
          expect(error).toBe('User Not Found')
          expect(user).toBe(null)
        })
    })
  })
  
  // it.todo('me')
  // describe('me', () => {
  //   it('should find my profile', () => {
  //     return request(app.getHttpServer())
  //       .post(GRAPHQL_ENDPOINT)
  //       .set('X-JWT',jwtToken)
  //       .send({
  //         query: `
  //         query{
  //           me{
  //            email
  //           }
  //          }
  //         `
  //       })
  //   })
  // })

  describe('me', () => {
    it('should find my profile', () => {
      return privateTest(`
          {
            me {
              email
            }
          }
        `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(testUser.email);
        });
    });
    it('should not allow logged out user', () => {
      return publicTest(`
          {
            me {
              email
            }
          }
        `)
        .expect(200)
        .expect(res => {
          const {
            body: { errors },
          } = res;
          const [error] = errors;
          expect(error.message).toBe('Forbidden resource');
        });
    });
  });

  // it.todo('verifyEmail')
  // it.todo('editProfile')

  describe('editProfile', () => {
    const NEW_EMAIL = 'nico@new.com';
    it('should change email', () => {
      return privateTest(`
            mutation {
              editProfile(input:{
                email: "${NEW_EMAIL}"
              }) {
                ok
                error
              }
            }
        `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should have new email', () => {
      return privateTest(`
          {
            me {
              email
            }
          }
        `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });

  describe('editProfile', () => {
    const NEW_EMAIL = 'nico@new.com';
    it('should change email', () => {
      return privateTest(`
            mutation {
              editProfile(input:{
                email: "${NEW_EMAIL}"
              }) {
                ok
                error
              }
            }
        `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                editProfile: { ok, error },
              },
            },
          } = res;
          expect(ok).toBe(true);
          expect(error).toBe(null);
        });
    });
    it('should have new email', () => {
      return privateTest(`
          {
            me {
              email
            }
          }
        `)
        .expect(200)
        .expect(res => {
          const {
            body: {
              data: {
                me: { email },
              },
            },
          } = res;
          expect(email).toBe(NEW_EMAIL);
        });
    });
  });
});
