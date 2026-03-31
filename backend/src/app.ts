import express from 'express';
import cors from 'cors';

import leadRoutes from './leads/lead.routes';
import visitRoutes from './visits/visit.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/leads', leadRoutes);
app.use('/api/visits', visitRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});