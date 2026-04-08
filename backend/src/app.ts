import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import leadRoutes from './leads/lead.routes';
import visitRoutes from './visits/visit.routes';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { AppDataSource } from "./config/data-source";

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/leads', leadRoutes);
app.use('/api/visits', visitRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

AppDataSource.initialize()
  .then(() => {
    console.log("DB connected");

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((error) => {
    console.error("Error connecting DB:", error);
  });