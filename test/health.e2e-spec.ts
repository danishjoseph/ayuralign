import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestAppModule } from './test-app.module';
import { createTestDb, dropTestDb } from './helpers';

const TEST_DB = 'smart_health_test_health';

describe('HealthModule (e2e)', () => {
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

  const vitals = {
    IR: 0.5,
    HeartRate: 72,
    SpO2: 98,
    TempC: 36.5,
    TempF: 97.7,
    GSR: 0.5,
    LSM_AccX: 0.1,
    LSM_AccY: 0.2,
    LSM_AccZ: 1.0,
  } as const;

  it('POST /health/send — should submit vitals and return status', () => {
    return request(httpServer)
      .post('/health/send')
      .send(vitals)
      .expect(201)
      .expect((res: request.Response) => {
        const body = res.body as Record<string, string>;
        expect(body).toEqual({
          HR_Status: 'Normal',
          SpO2_Status: 'Normal',
          Temp_Status: 'Normal',
          Stress_Level: 'Moderate',
          Movement_Status: 'Normal',
        });
      });
  });

  it('GET /health/recent — should return array of records', () => {
    return request(httpServer)
      .get('/health/recent')
      .expect(200)
      .expect((res: request.Response) => {
        const body = res.body as Array<Record<string, unknown>>;
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBeGreaterThanOrEqual(1);
        expect(body[0]).toHaveProperty('HeartRate', 72);
      });
  });

  it('GET /health/latest — should return the most recent record', () => {
    return request(httpServer)
      .get('/health/latest')
      .expect(200)
      .expect((res: request.Response) => {
        const body = res.body as Array<Record<string, unknown>>;
        expect(Array.isArray(body)).toBe(true);
        expect(body.length).toBe(1);
        expect(body[0]).toHaveProperty('HeartRate', 72);
      });
  });
});
