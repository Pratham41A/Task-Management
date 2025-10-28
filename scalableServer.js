import "dotenv/config"
import e from "express";
import fs from "fs";
import cluster from "cluster";
import chalk from "chalk";
import {cpus} from "os";
import {connectMongoDb} from "./config/mongoDb.js";
import {authRouter} from "./route/authRoutes.js";
import {taskRouter} from "./route/taskRoutes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import {jobScheduler} from "./service/jobScheduler.js";
import { fileURLToPath } from "url";

const server = e();




const totalCPU = cpus().length;

if (cluster.isPrimary) {
  console.log(chalk.bgBlueBright("Main",process.pid));
  //For Job Scheduling
  connectMongoDb().then(() => {
     console.log(chalk.bgBlueBright("Main Connected to MongoDB "));
      jobScheduler();
  }).catch((error) => {
    console.log(chalk.bgRedBright('Dis-Connected from MongoDB',error.message));
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
  const serverRequestWriteStream = fs.createWriteStream("ServerRequests.log", { flags: "a" });//Open File and Append Data
    server.use(morgan("tiny", { stream:serverRequestWriteStream }));
  //Logs Information about API Requests

  const __filename = fileURLToPath(import.meta.url);//Absolute Current File Path
  const __dirname = path.dirname(__filename);//Absolute Current Directory Path
  


  server.use(helmet());
  //Tackle Web Vulnerabilities by setting Response Headers


  server.use(e.json());
  server.use(cookieParser());
  server.use(
    cors({
      origin:process.env.ORIGIN,
        credentials: true,
    })
  );

  connectMongoDb()
    .then(async () => {
      console.log(chalk.bgBlueBright("Connected to MongoDB"));
       server.get('/api/log0', (req, res) => {return res.sendFile(path.join(__dirname, 'ServerRequests.log'));});
  server.use('/api/log1',e.static(path.join(__dirname, 'ServerRequests.log')));
  server.use("/api/auth", authRouter);
  server.use("/api/task", taskRouter);
      server.listen( process.env.PORT, function () {
          process.send("Connected");
        
      });
    })
    .catch((error) => {
      console.log(chalk.bgRedBright('Dis-Connected from MongoDB',error.message));
    });
}
