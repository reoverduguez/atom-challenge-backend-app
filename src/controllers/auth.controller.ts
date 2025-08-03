import { Request, Response } from 'express';
import { FirebaseError } from 'firebase-admin';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';
import { z } from 'zod';

import { findUserByEmail } from '../repositories/user.repository';
import { generateToken, register } from '../services/auth.service';

const authSchema = z.object({ email: z.email() });

export const authenticate = async (req: Request, res: Response) => {
  let providedEmail: string;

  try {
    ({ email: providedEmail } = authSchema.parse(req.body));
  } catch (err) {
    return res.status(400).json({ error: `Valid email is required`, details: err });
  }

  const user = await findUserByEmail(providedEmail);

  if (!user) {
    return res.status(401).json({ error: `${providedEmail} does not exist` });
  }

  try {
    const token = await generateToken(providedEmail);
    return res.status(200).json({ token });
  } catch (err) {
    return res.status(500).json({ error: `Failed to generate token`, details: err });
  }
};

export const registerAndAuthenticate = async (req: Request, res: Response) => {
  let providedEmail: string;
  try {
    ({ email: providedEmail } = authSchema.parse(req.body));
  } catch (err) {
    return res.status(400).json({ error: `Valid email is required`, details: err });
  }

  let firebaseUser: UserRecord;
  try {
    firebaseUser = await register(providedEmail);
  } catch (err) {
    if ((err as Error).name === 'UserExistsError') {
      return res
        .status(409)
        .json({ error: 'User already exists', details: (err as Error).message });
    }
    return res
      .status(500)
      .json({ error: 'Firebase error', details: (err as FirebaseError).message });
  }

  try {
    const token = await generateToken(firebaseUser.email!);
    return res.status(201).json({ token });
  } catch (err) {
    return res.status(500).json({ error: `Failed to generate token`, details: err });
  }
};
