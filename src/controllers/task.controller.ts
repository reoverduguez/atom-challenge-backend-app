import { Request, Response } from 'express';
import { z } from 'zod';

import { Task } from '../models/task.model';
import * as service from '../services/task.service';

const taskGetAndDeleteAndPutSchema = z.object({ id: z.string().regex(/^[a-zA-Z0-9_-]+$/) });
const taskCreateSchema = z.object({
  title: z.string(),
  description: z.string(),
  owner: z.string(),
  completed: z.boolean(),
});
const taskUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

export const getUserTasks = async (req: Request, res: Response) => {
  const providedUserId = req.params.id;
  try {
    const { id } = taskGetAndDeleteAndPutSchema.parse({ id: providedUserId });
    const tasks = await service.getUserTasks(id);
    return res.status(200).json(tasks);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Valid user id is required', details: err.message });
    }
    return res.status(500).json({ error: 'Failed to fetch tasks', details: err });
  }
};

export const getTask = async (req: Request, res: Response) => {
  const providedTaskId = req.params.id;
  try {
    const { id } = taskGetAndDeleteAndPutSchema.parse({ id: providedTaskId });
    const tasks = await service.getTask(id);
    return res.status(200).json(tasks);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Valid task id is required', details: err.message });
    }
    return res.status(500).json({ error: 'Failed to fetch task', details: err });
  }
};

export const create = async (req: Request, res: Response) => {
  let taskProvided: Omit<Task, 'id' | 'createdAt'>;
  try {
    taskProvided = taskCreateSchema.parse(req.body) as Task;
  } catch (err) {
    return res.status(400).json({
      error: 'Valid task parameters (title, description, owner, completed) are required',
      details: err,
    });
  }

  try {
    const newTask = await service.createTask(taskProvided);
    return res.status(201).json(newTask);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create task', details: err });
  }
};

export const update = async (req: Request, res: Response) => {
  let taskProvided: Partial<Task>;
  let providedTaskId: string;
  try {
    taskProvided = taskUpdateSchema.parse(req.body) as Task;
    ({ id: providedTaskId } = taskGetAndDeleteAndPutSchema.parse({ id: req.params.id }));
  } catch (err) {
    return res.status(400).json({
      error: 'Valid task id is required',
      details: err,
    });
  }

  try {
    const updatedTask = await service.updateTask(providedTaskId!, taskProvided);
    return res.status(200).json(updatedTask);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update task', details: err });
  }
};

export const remove = async (req: Request, res: Response) => {
  const providedTaskId = req.params.id;

  try {
    const parsed = taskGetAndDeleteAndPutSchema.parse({ id: providedTaskId });
    await service.deleteTask(parsed.id);
    return res.sendStatus(200);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Valid task id is required', details: err.message });
    }
    return res.status(500).json({ error: 'Failed to delete task', details: err });
  }
};
