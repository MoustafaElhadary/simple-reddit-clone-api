import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";
import { Post } from "./entity/Post";
import { Comment } from "./entity/Comments";
import { Vote } from "./entity/UserVote";
config();
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PGHOST,
  port: Number(`${process.env.PGPORT}`),
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  synchronize: true,
  logging: true,
  entities: [Post, Comment, Vote],
  migrations: ["migration/*.ts"],
  subscribers: [],
  cli: {
    migrationsDir: "src/migration",
  },
});
