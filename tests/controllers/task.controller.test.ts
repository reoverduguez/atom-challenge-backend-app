jest.mock('../../src/services/task.service');
jest.mock('../../src/middleware/firebaseAuth.ts', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authorizeFirebaseToken: (_req: any, _res: any, next: any) => next(),
}));

import express from 'express';
import request from 'supertest';

import { Task } from '../../src/models/task.model';
import taskRoutes from '../../src/routes/task.route';
import * as service from '../../src/services/task.service';

const app = express();
app.use(express.json());
app.use('/task', taskRoutes);

describe('Task Controller', () => {
  const mockTaskUUID = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserUUID = '3f2504e0-4f89-11d3-9a0c-0305e82c3301';
  const mockTask: Task = {
    id: mockTaskUUID,
    title: 'mock-title',
    description: 'mock-description',
    owner: mockUserUUID,
    completed: false,
    createdAt: new Date('2025-08-03T19:43:10.691Z'),
  };

  describe('GET /task/user/:id', () => {
    it('should return 200 and user tasks', async () => {
      (service.getUserTasks as jest.Mock).mockResolvedValue([mockTask]);

      const res = await request(app).get(`/task/user/${mockUserUUID}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          ...mockTask,
          createdAt: expect.any(String),
        },
      ]);
    });

    it('should return 400 if user id is invalid', async () => {
      const res = await request(app).get('/task/user/invalid-id!');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Valid user id is required');
    });
  });

  describe('GET /task/:id', () => {
    it('should return 200 and a task', async () => {
      (service.getTask as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app).get(`/task/${mockTaskUUID}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...mockTask,
        createdAt: expect.any(String),
      });
    });

    it('should return 400 if task id is invalid', async () => {
      const res = await request(app).get('/task/invalid-id!');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Valid task id is required');
    });
  });

  describe('POST /task', () => {
    const validPayload = {
      title: 'New Task',
      description: 'Description',
      owner: mockUserUUID,
      completed: false,
    };

    it('should return 201 and created task', async () => {
      (service.createTask as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app).post('/task').send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        ...mockTask,
        createdAt: expect.any(String),
      });
    });

    it('should return 400 if payload is invalid', async () => {
      const res = await request(app).post('/task').send({ title: 'Missing owner' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe(
        'Valid task parameters (title, description, owner, completed) are required',
      );
    });
  });

  describe('PUT /task/:id', () => {
    it('should return 200 and updated task', async () => {
      (service.updateTask as jest.Mock).mockResolvedValue(mockTask);

      const res = await request(app).put('/task/abc123').send(mockTask);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...mockTask,
        createdAt: expect.any(String),
      });
    });

    it('should return 400 if payload is missing id', async () => {
      const { id, ...payload } = mockTask;
      const res = await request(app).put('/task/invalid-id!').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Valid task id is required');
    });
  });

  describe('DELETE /task/:id', () => {
    it('should return 200 on successful deletion', async () => {
      (service.deleteTask as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app).delete(`/task/${mockTaskUUID}`);
      expect(res.status).toBe(200);
    });

    it('should return 400 if task id is invalid', async () => {
      const res = await request(app).delete(`/task/invalid-id!`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Valid task id is required');
    });
  });
});
