import { FirebaseError } from 'firebase-admin';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

import { auth } from '../firebase';
import { createUser, findUserByEmail } from '../repositories/user.repository';

export const generateToken = async (email: string): Promise<string> => {
  const firebaseUser = await auth.getUserByEmail(email);
  const token = await auth.createCustomToken(firebaseUser.uid);
  return token;
};

export const register = async (email: string): Promise<UserRecord> => {
  const user = await findUserByEmail(email);
  if (user) {
    const error = new Error('User already exists in Firebase store');
    error.name = 'UserExistsError';
    throw error;
  }

  let firebaseUser: UserRecord;
  try {
    firebaseUser = await auth.createUser({ email });
  } catch (err) {
    if ((err as FirebaseError).code === 'auth/email-already-exists') {
      const error = new Error('User already exists in Firebase auth');
      error.name = 'UserExistsError';
      throw error;
    } else {
      throw err;
    }
  }

  await createUser(firebaseUser.uid, email);

  return firebaseUser;
};
