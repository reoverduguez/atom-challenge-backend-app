// import { Timestamp } from 'firebase/firestore'; // for client SDK
import { Timestamp } from 'firebase-admin/firestore'; // for admin SDK

import { db } from '../firebase';
import { Task } from '../models/task.model';

export const getUserTasks = async (owner: string): Promise<Task[]> => {
  const querySnapshot = await db.collection('tasks').where('owner', '==', owner).get();
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      owner: data.owner,
      completed: data.completed,
      createdAt: (data.createdAt as Timestamp)?.toDate(),
    } as Task;
  });
};

export const getTask = async (id: string): Promise<Task | null> => {
  const doc = await db.collection('tasks').doc(id).get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data();
  return {
    id: doc.id,
    title: data?.title,
    description: data?.description,
    owner: data?.owner,
    completed: data?.completed,
    createdAt: (data?.createdAt as Timestamp)?.toDate(),
  } as Task;
};

export const createTask = async (data: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  const now = new Date();
  const newTask = { ...data, createdAt: now };
  const ref = await db.collection('tasks').add(newTask);
  return { id: ref.id, ...newTask };
};

export const updateTask = async (id: string, task: Partial<Task>): Promise<Task | null> => {
  const ref = db.collection('tasks').doc(id);
  await ref.update(task);
  const updatedDoc = await ref.get();
  if (!updatedDoc.exists) {
    return null;
  }
  const data = updatedDoc.data();
  return {
    id: updatedDoc.id,
    title: data?.title,
    description: data?.description,
    owner: data?.owner,
    completed: data?.completed,
    createdAt: (data?.createdAt as Timestamp)?.toDate(),
  } as Task;
};

export const deleteTask = async (id: string): Promise<void> => {
  await db.collection('tasks').doc(id).delete();
};
