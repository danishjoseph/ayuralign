import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

@Controller('test')
class TestController {
  @Get()
  get() {
    return { ok: true };
  }
}

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 10000, limit: 2 }])],
  controllers: [TestController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
class ThrottlerTestModule {}

describe('Throttler (e2e)', () => {
  let app: INestApplication;
  let httpServer: Express.Application;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerTestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as Express.Application;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should block requests that exceed the rate limit', async () => {
    await request(httpServer).get('/test').expect(200);
    await request(httpServer).get('/test').expect(200);
    await request(httpServer).get('/test').expect(429);
  });

  it('should reset the window after TTL expires', async () => {
    await new Promise((r) => setTimeout(r, 11000));
    await request(httpServer).get('/test').expect(200);
  }, 30000);
});
