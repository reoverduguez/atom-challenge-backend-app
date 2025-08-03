import { db } from '../firebase';
import { User } from '../models/user.model';

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const querySnapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  if (querySnapshot.empty) {
    return null;
  }
  const doc = querySnapshot.docs[0];
  const data = doc.data();
  return { id: doc.id, email: data.email };
};

export const findUserById = async (id: string): Promise<User | null> => {
  const snapshot = await db.collection('users').doc(id).get();
  if (!snapshot.exists) {
    return null;
  }
  const data = snapshot.data();
  return { id, email: data?.email };
};

export const createUser = async (uid: string, email: string): Promise<void> => {
  const now = new Date();
  await db.collection('users').doc(uid).set({ email, createdAt: now });
};
