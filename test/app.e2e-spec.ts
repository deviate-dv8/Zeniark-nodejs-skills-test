import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/db/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import helmet from 'helmet';
import morgan from 'morgan';
import { Role, User } from '@prisma/client';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  // Test data
  let userToken: string;
  let adminToken: string;
  let userId: string;
  // We'll use adminId in one of the tests to demonstrate its use
  let adminId: string;
  let noteId: string;
  let categoryId: string;
  let tagId: string;
  let noteIds: string[] = []; // For pagination testing

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
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();

    // Clean the database before tests
    await prisma.note.deleteMany();
    await prisma.tag.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    // Create test users (regular user and admin)
    const testUser: User = await prisma.user.create({
      data: {
        email: 'testuser@example.com',
        name: 'Test User',
        role: Role.USER,
      },
    });

    const adminUser: User = await prisma.user.create({
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

  describe('Notes endpoints with pagination', () => {
    // Create multiple notes for pagination testing
    it('should create multiple notes for pagination testing', async () => {
      // Create 15 notes to test pagination
      const notesToCreate = 15;
      for (let i = 0; i < notesToCreate; i++) {
        const response = await request(app.getHttpServer())
          .post('/api/notes')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            title: `Test Note ${i + 1}`,
            content: `This is test note ${i + 1}`,
            categoryId,
            tagIds: [tagId],
          })
          .expect(201);

        noteIds.push(response.body.id);

        // Set the first note ID for other tests
        if (i === 0) {
          noteId = response.body.id;
        }
      }

      // Verify we have created the expected number of notes
      expect(noteIds.length).toBe(notesToCreate);
    });

    it('should get paginated notes with default pagination (GET /api/notes)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/notes')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.items)).toBe(true);

      // Default pagination should return 10 items
      expect(response.body.items.length).toBe(10);

      // Check pagination metadata
      expect(response.body.meta).toEqual({
        page: 1,
        limit: 10,
        totalItems: 15,
        totalPages: 2,
      });

      // Check that the first note is present
      const firstNote = response.body.items[0];
      expect(firstNote).toHaveProperty('title');
      expect(firstNote).toHaveProperty('content');
    });

    it('should get paginated notes with custom page (GET /api/notes?page=2)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/notes?page=2')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.items)).toBe(true);

      // Second page should have the remaining 5 items
      expect(response.body.items.length).toBe(5);

      // Check pagination metadata
      expect(response.body.meta).toEqual({
        page: 2,
        limit: 10,
        totalItems: 15,
        totalPages: 2,
      });
    });

    it('should get paginated notes with custom limit (GET /api/notes?limit=5)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/notes?limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.items)).toBe(true);

      // Should return only 5 items
      expect(response.body.items.length).toBe(5);

      // Check pagination metadata
      expect(response.body.meta).toEqual({
        page: 1,
        limit: 5,
        totalItems: 15,
        totalPages: 3,
      });
    });

    it('should get paginated notes with both page and limit (GET /api/notes?page=2&limit=5)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/notes?page=2&limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('meta');
      expect(Array.isArray(response.body.items)).toBe(true);

      // Should return 5 items from the second page
      expect(response.body.items.length).toBe(5);

      // Check pagination metadata
      expect(response.body.meta).toEqual({
        page: 2,
        limit: 5,
        totalItems: 15,
        totalPages: 3,
      });
    });

    it('should handle invalid page values gracefully (GET /api/notes?page=abc)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/notes?page=abc')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400); // Bad Request because of validation error

      expect(response.body).toHaveProperty('message');
      expect(Array.isArray(response.body.message)).toBe(true);
      expect(
        response.body.message.some(
          (msg: string) => msg.includes('page') && msg.includes('number'),
        ),
      ).toBe(true);
    });

    it('should get a specific note (GET /api/notes/:id)', async () => {
      return request(app.getHttpServer())
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', noteId);
          expect(res.body).toHaveProperty('title', 'Test Note 1');
          expect(res.body).toHaveProperty('content', 'This is test note 1');
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
          // Using adminId to verify that the admin user is in the response
          const foundAdmin = res.body.some((user: User) => user.id === adminId);
          expect(foundAdmin).toBe(true);
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
    it('should delete all created notes', async () => {
      // Delete each note
      for (const id of noteIds) {
        await request(app.getHttpServer())
          .delete(`/api/notes/${id}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(200);
      }
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
