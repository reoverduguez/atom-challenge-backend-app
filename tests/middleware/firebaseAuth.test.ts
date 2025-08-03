import { Request, Response, NextFunction } from 'express';

import { auth } from '../../src/firebase';
import { authorizeFirebaseToken } from '../../src/middleware/firebaseAuth';

jest.mock('../../src/firebase', () => ({
  auth: {
    verifyIdToken: jest.fn(),
  },
}));

describe('authorizeFirebaseToken middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 if Authorization header is missing', async () => {
    await authorizeFirebaseToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or malformed authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header is malformed', async () => {
    req.headers = { authorization: 'Token xyz' };

    await authorizeFirebaseToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or malformed authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if token is valid', async () => {
    req.headers = { authorization: 'Bearer valid-token' };
    (auth.verifyIdToken as jest.Mock).mockResolvedValue({ uid: 'user123' });

    await authorizeFirebaseToken(req as Request, res as Response, next);

    expect(auth.verifyIdToken).toHaveBeenCalledWith('valid-token');
    expect(next).toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', async () => {
    req.headers = { authorization: 'Bearer invalid-token' };
    (auth.verifyIdToken as jest.Mock).mockRejectedValue(new Error('Token error'));

    await authorizeFirebaseToken(req as Request, res as Response, next);

    expect(auth.verifyIdToken).toHaveBeenCalledWith('invalid-token');
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid or expired token',
      message: expect.any(Error),
    });
    expect(next).not.toHaveBeenCalled();
  });
});
