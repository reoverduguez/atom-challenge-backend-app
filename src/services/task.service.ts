import { Task } from '../models/task.model';
import * as taskRepo from '../repositories/task.repository';
import * as userRepo from '../repositories/user.repository';

export const getUserTasks = async (owner: string): Promise<Task[]> => {
  const user = await userRepo.findUserById(owner);
  if (!user) {
    throw new Error(`user with id ${owner} does not exist`);
  }
  return taskRepo.getUserTasks(owner);
};

export const getTask = async (id: string): Promise<Task> => {
  const task = await taskRepo.getTask(id);
  if (!task) {
    throw new Error(`task with id ${id} does not exist`);
  }
  return task;
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> => {
  const user = await userRepo.findUserById(task.owner);
  if (!user) {
    throw new Error(`task owner with user id ${task.owner} does not exist`);
  }
  return taskRepo.createTask(task);
};

export const updateTask = async (id: string, data: Partial<Task>): Promise<Task> => {
  const updatedTask = await taskRepo.updateTask(id, data);
  if (!updatedTask) {
    throw new Error(`task with id ${id} does not exist`);
  }
  return updatedTask;
};

export const deleteTask = async (id: string): Promise<void> => {
  const task = await taskRepo.getTask(id);
  if (!task) {
    throw new Error(`task with id ${id} does not exist`);
  }
  await taskRepo.deleteTask(id);
};
