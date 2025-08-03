import { Request, Response, NextFunction } from 'express';

import { auth } from '../firebase';

export async function authorizeFirebaseToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    await auth.verifyIdToken(token);
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token', message: err });
  }
}
