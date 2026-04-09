import { Request, Response } from 'express';
import { authService } from './auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({
      message: error.message || 'Error creating user'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    const result = await authService.login(email, password, role);

    res.json(result);
  } catch (error: any) {
    res.status(401).json({
      message: error.message || 'Invalid credentials'
    });
  }
};