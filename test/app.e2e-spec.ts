import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/db/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import helmet from 'helmet';
import morgan from 'morgan';
import { Role } from '@prisma/client';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test data
  let userToken: string;
  let adminToken: string;
  let userId: string;
  let adminId: string;
  let noteId: string;
  let categoryId: string;
  let tagId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Get services
    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    // Apply the same middleware as in main.ts
    app.use(morgan('combined'));
    app.use(helmet());
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    // Clean the database before tests
    await prisma.note.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Create test users (regular user and admin)
    const testUser = await prisma.user.create({
      data: {
        email: 'testuser@example.com',
        name: 'Test User',
        role: Role.USER,
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        role: Role.ADMIN,
      },
    });

    // Store user IDs for later use
    userId = testUser.id;
    adminId = adminUser.id;

    // Generate JWT tokens
    userToken = jwtService.sign(
      {
        sub: testUser.id,
        email: testUser.email,
        role: testUser.role,
      },
      {
        issuer: 'NoteApp',
        audience: 'NoteApp',
      },
    );

    adminToken = jwtService.sign(
      {
        sub: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
      },
      {
        issuer: 'NoteApp',
        audience: 'NoteApp',
      },
    );
  });

  afterAll(async () => {
    // Clean up after all tests
    await prisma.note.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('Root endpoint', () => {
    it('/ (GET) should return welcome message', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect({ message: 'Zeniark NodeJS Skills Test - 2025' });
    });
  });

  describe('Auth endpoints', () => {
    it('/api/auth/me (GET) should return user info when authenticated', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('email', 'testuser@example.com');
        });
    });

    it('/api/auth/me (GET) should return 401 when not authenticated', () => {
      return request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });
  });

  describe('Categories endpoints', () => {
    it('should create a category (POST /api/categories)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test Category' })
        .expect(201);

      categoryId = response.body.id;
      expect(response.body).toHaveProperty('name', 'Test Category');
      expect(response.body).toHaveProperty('userId', userId);
    });

    it('should get all categories for a user (GET /api/categories/all)', async () => {
      return request(app.getHttpServer())
        .get('/api/categories/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].name).toBe('Test Category');
        });
    });

    it('should get a single category (GET /api/categories/:id)', async () => {
      return request(app.getHttpServer())
        .get(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', categoryId);
          expect(res.body).toHaveProperty('name', 'Test Category');
        });
    });

    it('should update a category (PATCH /api/categories/:id)', async () => {
      return request(app.getHttpServer())
        .patch(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Category' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Updated Category');
        });
    });
  });

  describe('Tags endpoints', () => {
    it('should create a tag (POST /api/tags)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/tags')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test Tag' })
        .expect(201);

      tagId = response.body.id;
      expect(response.body).toHaveProperty('name', 'Test Tag');
      expect(response.body).toHaveProperty('userId', userId);
    });

    it('should get all tags for a user (GET /api/tags)', async () => {
      return request(app.getHttpServer())
        .get('/api/tags')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].name).toBe('Test Tag');
        });
    });

    it('should get a single tag (GET /api/tags/:id)', async () => {
      return request(app.getHttpServer())
        .get(`/api/tags/${tagId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', tagId);
          expect(res.body).toHaveProperty('name', 'Test Tag');
        });
    });

    it('should update a tag (PATCH /api/tags/:id)', async () => {
      return request(app.getHttpServer())
        .patch(`/api/tags/${tagId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Tag' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('name', 'Updated Tag');
        });
    });
  });

  describe('Notes endpoints', () => {
    it('should create a note (POST /api/notes)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/notes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test Note',
          content: 'This is a test note',
          categoryId,
          tagIds: [tagId],
        })
        .expect(201);

      noteId = response.body.id;
      expect(response.body).toHaveProperty('title', 'Test Note');
      expect(response.body).toHaveProperty('content', 'This is a test note');
      expect(response.body).toHaveProperty('userId', userId);
      expect(response.body).toHaveProperty('categoryId', categoryId);
      expect(response.body.tagIds).toContain(tagId);
    });

    it('should get all notes for a user (GET /api/notes)', async () => {
      return request(app.getHttpServer())
        .get('/api/notes')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0].title).toBe('Test Note');
        });
    });

    it('should get a single note (GET /api/notes/:id)', async () => {
      return request(app.getHttpServer())
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', noteId);
          expect(res.body).toHaveProperty('title', 'Test Note');
          expect(res.body).toHaveProperty('content', 'This is a test note');
        });
    });

    it('should update a note (PATCH /api/notes/:id)', async () => {
      return request(app.getHttpServer())
        .patch(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Updated Note', content: 'Updated content' })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('title', 'Updated Note');
          expect(res.body).toHaveProperty('content', 'Updated content');
        });
    });
  });

  describe('Admin-only endpoints', () => {
    it('should allow admin to get all users (GET /api/users)', async () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThanOrEqual(2); // At least our two test users
        });
    });

    it('should deny regular user access to all users (GET /api/users)', async () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403); // Forbidden
    });

    it('should allow admin to get all notes (GET /api/notes/all)', async () => {
      return request(app.getHttpServer())
        .get('/api/notes/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should deny regular user access to all notes (GET /api/notes/all)', async () => {
      return request(app.getHttpServer())
        .get('/api/notes/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403); // Forbidden
    });
  });

  describe('DELETE operations', () => {
    it('should delete a note (DELETE /api/notes/:id)', async () => {
      return request(app.getHttpServer())
        .delete(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('should delete a tag (DELETE /api/tags/:id)', async () => {
      return request(app.getHttpServer())
        .delete(`/api/tags/${tagId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('should delete a category (DELETE /api/categories/:id)', async () => {
      return request(app.getHttpServer())
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });
  });
});
