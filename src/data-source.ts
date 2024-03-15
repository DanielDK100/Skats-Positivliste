import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { RegistrationEntity } from "./entities/RegistrationEntity";
dotenv.config();

export const AppDataSource = new DataSource({
  type: "mariadb",
  host: process.env.MYSQL_HOST,
  port: 3306,
  database: process.env.MYSQL_DATABASE,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  synchronize: process.env.NODE_ENV === "production" ? false : true,
  logging: false,
  entities: [RegistrationEntity],
  migrations: [],
  subscribers: [],
});
