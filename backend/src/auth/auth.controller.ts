import { Request, Response } from 'express';
import { AuthError, authService } from './auth.service';

function responder(res: Response, error: unknown, fallback: number): void {
  if (error instanceof AuthError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  res.status(fallback).json({ message: 'Error inesperado' });
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    res.json(await authService.login(email, password));
  } catch (error) {
    responder(res, error, 401);
  }
};

export const crearUsuario = async (req: Request, res: Response) => {
  try {
    const { name, email, password, roles, empresaId } = req.body;
    const user = await authService.crearUsuario({ name, email, password, roles, empresaId });
    res.status(201).json(user);
  } catch (error) {
    responder(res, error, 400);
  }
};

export const cambiarPassword = async (req: Request, res: Response) => {
  try {
    const { actual, nueva } = req.body;
    const userId = (req as Request & { user?: { id: number } }).user?.id;
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }
    await authService.cambiarPassword(userId, actual, nueva);
    res.status(204).send();
  } catch (error) {
    responder(res, error, 400);
  }
};
