import { Router } from 'express';
import { AppDataSource } from '../config/data-source';
import { Property } from './property.entity';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Property);
    const properties = await repo.find();

    res.json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching properties' });
  }
});

export default router;