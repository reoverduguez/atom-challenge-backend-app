jest.mock('../../src/firebase.ts', () => {
  const getMock = jest.fn().mockResolvedValue({
    empty: false,
    docs: [
      {
        id: 'mock-user-id',
        data: () => ({
          id: 'mock-user-id',
          email: 'mock@example.com',
        }),
      },
    ],
  });
  const setMock = jest.fn().mockResolvedValue(undefined);
  const docMock = {
    set: setMock,
    get: jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        id: 'mock-user-id',
        email: 'mock@example.com',
      }),
    }),
  };
  const collectionMock = jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: getMock,
    doc: jest.fn(() => docMock),
  }));

  return {
    db: {
      collection: collectionMock,
    },
  };
});

import * as userRepo from '../../src/repositories/user.repository';

describe('User Repository', () => {
  test('findUserByEmail should return a user if found', async () => {
    const { db } = await import('../../src/firebase');
    const collectionFn = db.collection as jest.Mock;
    const getMock = jest.fn().mockResolvedValue({
      empty: false,
      docs: [
        {
          id: 'mock-user-id',
          data: () => ({
            id: 'mock-user-id',
            email: 'mock@example.com',
          }),
        },
      ],
    });
    collectionFn.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: getMock,
    });

    const actual = await userRepo.findUserByEmail('mock@example.com');

    expect(actual).toEqual({
      id: 'mock-user-id',
      email: 'mock@example.com',
    });
  });

  test('findUserByEmail should return null if no user found', async () => {
    const { db } = await import('../../src/firebase');
    const collectionFn = db.collection as jest.Mock;
    const getMock = jest.fn().mockResolvedValue({ empty: true });
    collectionFn.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: getMock,
    });

    const actual = await userRepo.findUserByEmail('notfound@example.com');

    expect(actual).toBeNull();
  });

  test('findUserById should return a user if found', async () => {
    const { db } = await import('../../src/firebase');
    const collectionFn = db.collection as jest.Mock;
    const getMock = jest.fn().mockResolvedValue({
      exists: true,
      data: () => ({
        id: 'mock-user-id',
        email: 'mock@example.com',
      }),
    });
    collectionFn.mockReturnValue({
      doc: jest.fn(() => ({ get: getMock })),
    });

    const actual = await userRepo.findUserById('mock-user-id');

    expect(actual).toEqual({
      id: 'mock-user-id',
      email: 'mock@example.com',
    });
  });

  test('findUserById should return null if no user found', async () => {
    const { db } = await import('../../src/firebase');
    const collectionFn = db.collection as jest.Mock;
    const getMock = jest.fn().mockResolvedValue({ exists: false });
    collectionFn.mockReturnValue({
      doc: jest.fn(() => ({ get: getMock })),
    });

    const actual = await userRepo.findUserById('non-existent-id');

    expect(actual).toBeNull();
  });

  test('createUser should call set with correct data', async () => {
    const { db } = await import('../../src/firebase');
    const collectionFn = db.collection as jest.Mock;
    const setMock = jest.fn().mockResolvedValue(undefined);
    const docMock = { set: setMock };
    collectionFn.mockReturnValue({
      doc: jest.fn(() => docMock),
    });
    const now = new Date();

    await userRepo.createUser('mock-user-id', 'mock@example.com');

    expect(setMock).toHaveBeenCalledWith({
      email: 'mock@example.com',
      createdAt: now,
    });
  });
});
