import "reflect-metadata";
import { DataSource } from "typeorm";
import { RegistrationEntity } from "./entity/RegistrationEntity";
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(__dirname, ".env") });

export const AppDataSource = new DataSource({
  type: "mariadb",
  host: process.env.MYSQL_HOST,
  port: 3306,
  database: process.env.MYSQL_DATABASE,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  synchronize: true,
  logging: false,
  entities: [RegistrationEntity],
  migrations: [],
  subscribers: [],
});
