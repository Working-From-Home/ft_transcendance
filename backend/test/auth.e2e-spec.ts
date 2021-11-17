import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication System', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles a signup request', async () => {
    const email = 'emaili@mail.com';
    const username = 'username';
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, username, password: 'password' })
      .expect(201)
      .then((res) => {
        const { id, email, username } = res.body;
        expect(id).toBeDefined();
        expect(email).toEqual(email);
        expect(username).toEqual(username);
      })
  });
});
