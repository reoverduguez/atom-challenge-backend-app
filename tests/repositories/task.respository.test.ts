jest.mock('../../src/firebase.ts', () => {
  const addMock = jest.fn().mockResolvedValue({ id: 'mock-id' });
  const getMock = jest.fn().mockResolvedValue({
    docs: [
      {
        id: 'mock-id-1',
        data: () => ({
          title: 'mock-title-1',
          description: 'mock-description',
          owner: 'mock-owner',
          completed: false,
          createdAt: Timestamp.fromDate(new Date('2025-08-01')),
        }),
      },
      {
        id: 'mock-id-2',
        data: () => ({
          title: 'mock-title-2',
          description: 'mock-description',
          owner: 'mock-owner',
          completed: false,
          createdAt: Timestamp.fromDate(new Date('2025-08-01')),
        }),
      },
    ],
  });
  const docMock = {
    get: jest.fn().mockResolvedValue({
      exists: true,
      id: 'mock-task-id',
      data: () => ({
        title: 'mock-title',
        description: 'mock-description',
        owner: 'mock-owner',
        completed: false,
        createdAt: Timestamp.fromDate(new Date('2025-08-01')),
      }),
    }),
  };
  const collectionMock = jest.fn(() => ({
    add: addMock,
    where: jest.fn().mockReturnThis(),
    get: getMock,
    doc: jest.fn(() => docMock),
  }));
  return {
    db: {
      collection: collectionMock,
    },
  };
});

import { Timestamp } from 'firebase-admin/firestore';

import { Task } from '../../src/models/task.model';
import * as taskRepo from '../../src/repositories/task.repository';

describe('Task Repository', () => {
  test('createTask should add a new task and return it', async () => {
    const mockTask: Omit<Task, 'id' | 'createdAt'> = {
      title: 'mock-title',
      description: 'mock-description',
      owner: 'mock-owner',
      completed: false,
    };

    const actual = await taskRepo.createTask(mockTask);

    expect(actual).toEqual(
      expect.objectContaining({
        id: 'mock-id',
        title: 'mock-title',
        description: 'mock-description',
        owner: 'mock-owner',
        completed: false,
        createdAt: expect.any(Date),
      }),
    );
  });

  test('getUserTask should return list of tasks', async () => {
    const actual = await taskRepo.getUserTasks('mock-owner');

    expect(actual).toEqual([
      expect.objectContaining({
        id: 'mock-id-1',
        title: 'mock-title-1',
        owner: 'mock-owner',
        completed: false,
      }),
      expect.objectContaining({
        id: 'mock-id-2',
        title: 'mock-title-2',
        owner: 'mock-owner',
        completed: false,
      }),
    ]);
  });

  test('getTask should return a task by id if it exists', async () => {
    const actual = await taskRepo.getTask('mock-task-id');

    expect(actual).toEqual(
      expect.objectContaining({
        id: 'mock-task-id',
        title: 'mock-title',
        description: 'mock-description',
        owner: 'mock-owner',
        completed: false,
        createdAt: expect.any(Date),
      }),
    );
  });

  test('getTask should return null if the task does not exist', async () => {
    const { db } = await import('../../src/firebase');
    const collectionFn = db.collection as jest.Mock;
    const docFn = jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });

    collectionFn.mockReturnValue({
      doc: docFn,
    });

    const actual = await taskRepo.getTask('non-existent-id');

    expect(actual).toBeNull();
  });

  test('updateTask should update a task and return the updated version', async () => {
    const updateMock = jest.fn().mockResolvedValue(undefined);
    const getMock = jest.fn().mockResolvedValue({
      exists: true,
      id: 'mock-task-id',
      data: () => ({
        title: 'updated-title',
        description: 'mock-description',
        owner: 'mock-owner',
        completed: false,
        createdAt: Timestamp.fromDate(new Date('2025-08-01')),
      }),
    });

    const docFn = jest.fn().mockReturnValue({
      update: updateMock,
      get: getMock,
    });

    const { db } = await import('../../src/firebase');
    const collectionFn = db.collection as jest.Mock;
    collectionFn.mockReturnValue({ doc: docFn });

    const actual = await taskRepo.updateTask('mock-task-id', {
      title: 'updated-title',
    });

    expect(updateMock).toHaveBeenCalledWith({ title: 'updated-title' });

    expect(actual).toEqual(
      expect.objectContaining({
        id: 'mock-task-id',
        title: 'updated-title',
      }),
    );
  });

  test('updateTask should return null if task does not exist', async () => {
    const { db } = await import('../../src/firebase');
    const collectionFn = db.collection as jest.Mock;

    const docFn = jest.fn().mockReturnValue({
      update: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue({ exists: false }),
    });

    collectionFn.mockReturnValue({ doc: docFn });

    const actual = await taskRepo.updateTask('non-existent-id', {
      title: 'updated-title',
    });

    expect(actual).toBeNull();
  });

  test('deleteTask should call delete on the correct document', async () => {
    const deleteMock = jest.fn().mockResolvedValue(undefined);
    const docFn = jest.fn().mockReturnValue({ delete: deleteMock });

    const { db } = await import('../../src/firebase');
    const collectionFn = db.collection as jest.Mock;
    collectionFn.mockReturnValue({ doc: docFn });

    await taskRepo.deleteTask('mock-task-id');

    expect(collectionFn).toHaveBeenCalledWith('tasks');
    expect(docFn).toHaveBeenCalledWith('mock-task-id');
    expect(deleteMock).toHaveBeenCalled();
  });
});
