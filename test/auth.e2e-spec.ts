import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';
import { createTestDb, dropTestDb } from './helpers';

const TEST_DB = 'smart_health_test_auth';

describe('AuthModule (e2e)', () => {
  let app: INestApplication;
  let httpServer: Express.Application;

  beforeAll(async () => {
    process.env.DB_NAME = TEST_DB;
    process.env.DB_SYNCHRONIZE = 'true';

    await createTestDb(TEST_DB);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TestAppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as Express.Application;
  }, 30000);

  afterAll(async () => {
    await app.close();
    await dropTestDb(TEST_DB);
  }, 30000);

  const testUser = {
    name: 'E2E Test User',
    phone: '9999999999',
    dob: '1990-01-01',
    email: `e2e-${Date.now()}@test.com`,
    password: 'testpass123',
  } as const;

  it('POST /auth/register — should register a new user', () => {
    return request(httpServer)
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res: request.Response) => {
        const body = res.body as Record<string, unknown>;
        expect(body.message).toBe('User registered successfully');
        expect(body.loginid).toBeDefined();
        expect(typeof body.loginid).toBe('number');
      });
  });

  it('POST /auth/register — should reject duplicate email', async () => {
    await request(httpServer).post('/auth/register').send(testUser).expect(409);
  });

  it('POST /auth/login — should succeed with correct credentials', () => {
    return request(httpServer)
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200)
      .expect((res: request.Response) => {
        const body = res.body as {
          task: string;
          type: string;
          username: string;
        };
        expect(body.task).toBe('success');
        expect(body.type).toBe('user');
        expect(body.username).toBe(testUser.email);
      });
  });

  it('POST /auth/login — should fail with wrong password', () => {
    return request(httpServer)
      .post('/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' })
      .expect(401);
  });

  it('POST /auth/login — should fail for non-existent user', () => {
    return request(httpServer)
      .post('/auth/login')
      .send({ email: 'nonexistent@test.com', password: 'testpass123' })
      .expect(401);
  });
});
