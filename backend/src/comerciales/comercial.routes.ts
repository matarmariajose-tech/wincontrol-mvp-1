import { Router } from 'express';
import { AppDataSource } from '../config/data-source';
import { Comercial } from './comercial.entity';
import { authMiddleware } from '../auth/auth.middleware';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Comercial);
    res.json(await repo.find());
  } catch (e) {
    res.status(500).json({ error: 'Error fetching comerciales' });
  }
});

router.post('/', async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Comercial);
    const nuevo = repo.create({ nombre: req.body.nombre });
    res.status(201).json(await repo.save(nuevo));
  } catch (e) {
    res.status(500).json({ error: 'Error creating comercial' });
  }
});

export default router;