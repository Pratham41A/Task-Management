import e from "express";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import fs from "fs";
import chalk from "chalk";
import {connectMongoDb} from "./config/mongoDb.js";
import {connectRedisDb} from "./config/redisDb.js";
import authRouter from "./route/authRoutes.js";
import taskRouter from "./route/taskRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import {scheduler} from "./service/scheduler.js";
import path from 'path';
import { fileURLToPath } from 'url';

const { config } = dotenv;
config();
const server = e();
const PORT = process.env.PORT;
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 60,
  standardHeaders: true, //response headers
  legacyHeaders: true, //response headers
});


const apiRequestWriteStream = fs.createWriteStream("ServerRequests.log", { flags: "a" });//Open File and Append Data

   


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

server.get('/api/log', (req, res) => {
  res.sendFile(path.join(__dirname, 'ServerRequests.log'));
});
  server.use(helmet());
  //Tackle Web Vulnerabilities by setting Response Headers
  server.use(morgan("tiny", { stream:apiRequestWriteStream }));
  //Logs Information about API Requests
  server.use(limiter);
  server.use(e.json());
  server.use(cookieParser());
  server.use(
    cors({
      origin: "*"
    })
  );

  server.use("/api/auth", authRouter);
  server.use("/api/task", taskRouter);

  Promise.all([connectMongoDb(), connectRedisDb()])
    .then( () => {
      console.log(chalk.blue("Connected to MongoDB and Redis"));
        scheduler();
      server.listen(PORT, function () {
          console.log("Server Started Listening");
        
      });
    })
    .catch((err) => {
      console.log(err.message)
    });

