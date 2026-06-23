import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { Visit } from "../visits/domain/visit.entity";
import { User } from "../users/user.entity";
import { Lead } from "../leads/domain/lead.entity";
import { LeadStateHistory } from "../leads/domain/lead-state-history.entity";
import { Property } from "../properties/property.entity";
import { Comercial } from '../comerciales/comercial.entity';

export const AppDataSource = new DataSource({
  type: "postgres",
  ...(process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }),
  synchronize: true,
  logging: false,
  entities: [User, Visit, Lead, LeadStateHistory, Property, Comercial],
});
