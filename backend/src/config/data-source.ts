import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { Visit } from "../visits/domain/visit.entity";
import { User } from "../users/user.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, // solo dev
  logging: false,
  entities: [User, Visit],
});