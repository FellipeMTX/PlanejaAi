import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp, TestDatabaseManager } from './test-setup';
import { PrismaService } from '../src/modules/shared/services/prisma.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dbManager: TestDatabaseManager;

  beforeAll(async () => {
    app = await createTestApp();
    const prisma = app.get(PrismaService);
    dbManager = new TestDatabaseManager(prisma);
  });

  afterAll(async () => {
    await dbManager.cleanup();
    await app.close();
  });

  describe('POST /auth/signup', () => {
    it('should create a new user and return token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'Test User',
          email: `signup-test-${Date.now()}@test.com`,
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return error for duplicate email', async () => {
      const email = `duplicate-${Date.now()}@test.com`;

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'Test User 1',
          email,
          password: 'password123',
        })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'Test User 2',
          email,
          password: 'password123',
        })
        .expect(409);

      expect(response.body.details).toContain('Este e-mail já está em uso');
    });

    it('should return validation error for invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.fields).toHaveProperty('email');
    });
  });

  describe('POST /auth/login', () => {
    const testEmail = `login-test-${Date.now()}@test.com`;
    const testPassword = 'password123';

    beforeAll(async () => {
      await request(app.getHttpServer()).post('/auth/signup').send({
        name: 'Login Test User',
        email: testEmail,
        password: testPassword,
      });
    });

    it('should return token for valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testEmail);
    });

    it('should return error for invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.details).toContain('E-mail ou senha incorretos');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.details).toContain('E-mail ou senha incorretos');
    });
  });

  describe('GET /auth/me', () => {
    let token: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          name: 'Me Test User',
          email: `me-test-${Date.now()}@test.com`,
          password: 'password123',
        });

      token = response.body.token;
    });

    it('should return user data for authenticated request', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return error for unauthenticated request', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should return error for invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
