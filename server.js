import "dotenv/config"
import e from "express";
import fs from "fs";
import chalk from "chalk";
import {connectMongoDb} from "./config/mongoDb.js";
import {authRouter} from "./route/authRoutes.js";
import {taskRouter} from "./route/taskRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import {jobScheduler} from "./service/jobScheduler.js";
import path from 'path';
import { fileURLToPath } from 'url';


const server = e();


const serverRequestWriteStream = fs.createWriteStream("ServerRequests.log", { flags: "a" });//Open File and Append Data
  server.use(morgan("tiny", { stream:serverRequestWriteStream }));
  //Logs Information about Server Requests

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



  server.use(helmet());
  //Tackle Web Vulnerabilities by setting Response Headers
  server.use(e.json());
  server.use(cookieParser());
server.use(cors({
  origin:process.env.ORIGIN,
  credentials: true,
}));

  connectMongoDb()
    .then( () => {
      console.log(chalk.bgBlueBright("Connected to MongoDB"));
        jobScheduler();
         server.get('/api/log0', (req, res) => {return res.sendFile(path.join(__dirname, 'ServerRequests.log'));});
server.use('/api/log1',e.static(path.join(__dirname, 'ServerRequests.log')));
  server.use("/api/auth", authRouter);
  server.use("/api/task", taskRouter);
      server.listen(process.env.PORT, function () {
          console.log(chalk.bgBlueBright("Server Started Listening"));
        
      });
    })
    .catch((error) => {
      console.log(chalk.bgRedBright('Dis-Connected from MongoDB',error.message));
    });

