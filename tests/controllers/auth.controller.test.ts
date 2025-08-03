import express from 'express';
import { UserMetadata, UserRecord } from 'firebase-admin/lib/auth/user-record';
import request from 'supertest';

import * as userRepo from '../../src/repositories/user.repository';
import authRoutes from '../../src/routes/auth.route';
import * as authService from '../../src/services/auth.service';

jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/services/auth.service');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Controller', () => {
  const mockEmail = 'test@example.com';
  const mockToken = 'mocked-token';

  const mockUser: UserRecord = {
    uid: 'uid123',
    email: mockEmail,
    emailVerified: true,
    displayName: undefined,
    phoneNumber: undefined,
    photoURL: undefined,
    disabled: false,
    metadata: {
      creationTime: '2023-01-01T00:00:00Z',
      lastSignInTime: '2023-01-02T00:00:00Z',
    } as UserMetadata,
    providerData: [],
    toJSON: () => ({}),
  };

  describe('POST /auth', () => {
    test('should return 400 for missing email', async () => {
      const res = await request(app).post('/auth').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Valid email is required');
    });

    test('should return 401 if user not found', async () => {
      (userRepo.findUserByEmail as jest.Mock).mockResolvedValue(null);
      const res = await request(app).post('/auth').send({ email: mockEmail });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe(`${mockEmail} does not exist`);
    });

    test('should return 200 and token if user exists', async () => {
      (userRepo.findUserByEmail as jest.Mock).mockResolvedValue({ email: mockEmail });
      (authService.generateToken as jest.Mock).mockResolvedValue(mockToken);

      const res = await request(app).post('/auth').send({ email: mockEmail });
      expect(res.status).toBe(200);
      expect(res.body.token).toBe(mockToken);
    });

    test('should return 500 if token generation fails', async () => {
      (userRepo.findUserByEmail as jest.Mock).mockResolvedValue({ email: mockEmail });
      (authService.generateToken as jest.Mock).mockRejectedValue(new Error('fail'));

      const res = await request(app).post('/auth').send({ email: mockEmail });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to generate token');
    });
  });

  describe('POST /auth/register', () => {
    test('should return 400 for invalid email', async () => {
      const res = await request(app).post('/auth/register').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Valid email is required');
    });

    test('should return 409 if user already exists', async () => {
      const error = new Error('User already exists');
      error.name = 'UserExistsError';
      (authService.register as jest.Mock).mockRejectedValue(error);

      const res = await request(app).post('/auth/register').send({ email: mockEmail });
      expect(res.status).toBe(409);
      expect(res.body.error).toBe('User already exists');
    });

    test('should return 500 on Firebase error', async () => {
      (authService.register as jest.Mock).mockRejectedValue({ message: 'firebase failure' });

      const res = await request(app).post('/auth/register').send({ email: mockEmail });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Firebase error');
    });

    test('should return 201 and token if successful', async () => {
      (authService.register as jest.Mock).mockResolvedValue(mockUser);
      (authService.generateToken as jest.Mock).mockResolvedValue(mockToken);

      const res = await request(app).post('/auth/register').send({ email: mockEmail });
      expect(res.status).toBe(201);
      expect(res.body.token).toBe(mockToken);
    });

    test('should return 500 if token generation fails after register', async () => {
      (authService.register as jest.Mock).mockResolvedValue(mockUser);
      (authService.generateToken as jest.Mock).mockRejectedValue(new Error('fail'));

      const res = await request(app).post('/auth/register').send({ email: mockEmail });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to generate token');
    });
  });
});
