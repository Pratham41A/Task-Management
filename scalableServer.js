import e from "express";
import dotenv from "dotenv";
import { rateLimit } from "express-rate-limit";
import fs from "fs";
import cluster from "cluster";
import chalk from "chalk";
import os from "os";
import {connectMongoDb} from "./config/mongoDb.js";
import {connectRedisDb} from "./config/redisDb.js";
import authRouter from "./route/authRoutes.js";
import taskRouter from "./route/taskRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import {scheduler} from "./service/scheduler.js";

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
const totalCPU = os.cpus().length;

if (cluster.isPrimary) {
  console.log("Main",process.pid);
  //For Job Scheduling
  connectMongoDb().then(() => {
     console.log(chalk.blue("Main Connected to MongoDB "));
      scheduler();
  })
  for (var i = 0; i < totalCPU; i++) {
 const worker = cluster.fork();
 //Process Messaging
   worker.on("message", function (para) {
    console.log("Message : ",para,"from",worker.process.pid);
  });
  }
  //Process Exiting
  cluster.on("exit", function (worker, code, signal) {
    console.log("Worker",worker.process.pid,"Exited with Code",code,"and Signal",signal);
  });

} else {



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
    .then(async () => {
      console.log(chalk.blue("Connected to MongoDB and Redis"));
     
      server.listen(PORT, function () {
          process.send("Connected");
        
      });
    })
    .catch((err) => {
      process.send('Dis-Connected')
    });
}
