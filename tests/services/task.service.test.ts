import * as admin from 'firebase-admin';

import { Task } from '../../src/models/task.model';
import * as taskRepo from '../../src/repositories/task.repository';
import * as userRepo from '../../src/repositories/user.repository';
import * as taskService from '../../src/services/task.service';

jest.mock('../../src/repositories/task.repository');
jest.mock('../../src/repositories/user.repository');

describe('Task Service', () => {
  const mockUser = { id: 'mock-user', name: 'John Doe' };
  const mockTask: Task = {
    id: 'mock-id',
    title: 'mock-title',
    description: 'mock-description',
    owner: 'mock-user',
    completed: false,
    createdAt: new admin.firestore.Timestamp(123456, 0).toDate(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserTasks', () => {
    it('should return tasks if user exists', async () => {
      (userRepo.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (taskRepo.getUserTasks as jest.Mock).mockResolvedValue([mockTask]);

      const actual = await taskService.getUserTasks('mock-user');

      expect(actual).toEqual([mockTask]);
      expect(userRepo.findUserById).toHaveBeenCalledWith('mock-user');
      expect(taskRepo.getUserTasks).toHaveBeenCalledWith('mock-user');
    });

    it('should throw error if user does not exist', async () => {
      (userRepo.findUserById as jest.Mock).mockResolvedValue(null);

      await expect(taskService.getUserTasks('invalid-user')).rejects.toThrow(
        'user with id invalid-user does not exist',
      );
    });
  });

  describe('getTask', () => {
    it('should return task if found', async () => {
      (taskRepo.getTask as jest.Mock).mockResolvedValue(mockTask);

      const actual = await taskService.getTask('mock-id');

      expect(actual).toEqual(mockTask);
    });

    it('should throw error if task not found', async () => {
      (taskRepo.getTask as jest.Mock).mockResolvedValue(null);

      await expect(taskService.getTask('invalid-id')).rejects.toThrow(
        'task with id invalid-id does not exist',
      );
    });
  });

  describe('createTask', () => {
    const taskInput = {
      title: 'New Task',
      description: 'Desc',
      owner: 'user123',
      completed: false,
    };

    it('should create task if user exists', async () => {
      (userRepo.findUserById as jest.Mock).mockResolvedValue(mockUser);
      (taskRepo.createTask as jest.Mock).mockResolvedValue(mockTask);

      const result = await taskService.createTask(taskInput);

      expect(result).toEqual(mockTask);
      expect(taskRepo.createTask).toHaveBeenCalledWith(taskInput);
    });

    it('should throw error if user does not exist', async () => {
      (userRepo.findUserById as jest.Mock).mockResolvedValue(null);

      await expect(taskService.createTask(taskInput)).rejects.toThrow(
        'task owner with user id user123 does not exist',
      );
    });
  });

  describe('updateTask', () => {
    it('should update and return task if it exists', async () => {
      (taskRepo.updateTask as jest.Mock).mockResolvedValue(mockTask);

      const actual = await taskService.updateTask('mock-id', { title: 'Updated' });

      expect(actual).toEqual(mockTask);
    });

    it('should throw error if task does not exist', async () => {
      (taskRepo.updateTask as jest.Mock).mockResolvedValue(null);

      await expect(taskService.updateTask('mock-id', { title: 'Updated' })).rejects.toThrow(
        'task with id mock-id does not exist',
      );
    });
  });

  describe('deleteTask', () => {
    it('should call delete if task exists', async () => {
      (taskRepo.getTask as jest.Mock).mockResolvedValue(mockTask);
      (taskRepo.deleteTask as jest.Mock).mockResolvedValue(undefined);

      await taskService.deleteTask('mock-id');

      expect(taskRepo.getTask).toHaveBeenCalledWith('mock-id');
      expect(taskRepo.deleteTask).toHaveBeenCalledWith('mock-id');
    });

    it('should throw error if task does not exist', async () => {
      (taskRepo.getTask as jest.Mock).mockResolvedValue(null);

      await expect(taskService.deleteTask('missing')).rejects.toThrow(
        'task with id missing does not exist',
      );
    });
  });
});
