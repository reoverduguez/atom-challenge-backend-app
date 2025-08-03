import { FirebaseError } from 'firebase-admin';
import { UserRecord, UserMetadata } from 'firebase-admin/lib/auth/user-record';

import { auth } from '../../src/firebase';
import * as userRepo from '../../src/repositories/user.repository';
import { generateToken, register } from '../../src/services/auth.service';

jest.mock('../../src/firebase', () => ({
  auth: {
    getUserByEmail: jest.fn(),
    createCustomToken: jest.fn(),
    createUser: jest.fn(),
  },
}));

jest.mock('../../src/repositories/user.repository', () => ({
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
}));

describe('auth.service', () => {
  const mockEmail = 'test@example.com';
  const mockUid = 'mock-uid';
  const mockUser: UserRecord = {
    uid: mockUid,
    email: mockEmail,
    emailVerified: false,
    displayName: undefined,
    phoneNumber: undefined,
    photoURL: undefined,
    disabled: false,
    metadata: {} as UserMetadata,
    providerData: [],
    toJSON: () => ({}),
  };

  describe('generateToken', () => {
    it('should return a custom token for a valid email', async () => {
      (auth.getUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (auth.createCustomToken as jest.Mock).mockResolvedValue('mock-token');

      const token = await generateToken(mockEmail);

      expect(auth.getUserByEmail).toHaveBeenCalledWith(mockEmail);
      expect(auth.createCustomToken).toHaveBeenCalledWith(mockUid);
      expect(token).toBe('mock-token');
    });
  });

  describe('register', () => {
    it('should throw if user already exists in user.repository', async () => {
      (userRepo.findUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(register(mockEmail)).rejects.toThrow('User already exists in Firebase store');
    });

    it('should throw if Firebase returns auth/email-already-exists error', async () => {
      (userRepo.findUserByEmail as jest.Mock).mockResolvedValue(null);
      const firebaseError: Partial<FirebaseError> = {
        code: 'auth/email-already-exists',
      };
      (auth.createUser as jest.Mock).mockRejectedValue(firebaseError);

      await expect(register(mockEmail)).rejects.toThrow('User already exists in Firebase auth');
    });

    it('should throw other Firebase errors', async () => {
      (userRepo.findUserByEmail as jest.Mock).mockResolvedValue(null);
      const otherError = new Error('Unexpected error');
      (auth.createUser as jest.Mock).mockRejectedValue(otherError);

      await expect(register(mockEmail)).rejects.toThrow('Unexpected error');
    });

    it('should create user in Firebase and local repo if not exists', async () => {
      (userRepo.findUserByEmail as jest.Mock).mockResolvedValue(null);
      (auth.createUser as jest.Mock).mockResolvedValue(mockUser);
      (userRepo.createUser as jest.Mock).mockResolvedValue(undefined);

      const result = await register(mockEmail);

      expect(auth.createUser).toHaveBeenCalledWith({ email: mockEmail });
      expect(userRepo.createUser).toHaveBeenCalledWith(mockUid, mockEmail);
      expect(result).toEqual(mockUser);
    });
  });
});
