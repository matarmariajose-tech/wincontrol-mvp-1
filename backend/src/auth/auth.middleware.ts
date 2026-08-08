import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido');
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header) {
    res.status(401).json({ message: 'No token' });
    return;
  }

  try {
    const decoded = jwt.verify(header.replace('Bearer ', ''), JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
