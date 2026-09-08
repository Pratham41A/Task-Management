import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { connectMongoDb } from "./config/mongoDb.js";
import { authRouter } from "./route/authRoutes.js";
import { taskRouter } from "./route/taskRoutes.js";

(async function () {
  try {
    const { FRONTEND_SERVER_URL, PORT } = process.env;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    await connectMongoDb();

    const app = express();

    // Server Request Logger
    const serverRequestLoggerWriteStream = fs.createWriteStream(
      path.join(__dirname, "ServerRequests.log"),
      { flags: "a" }
    );

    app.use(
      morgan(
        ":remote-addr :date[iso] :method :url :status :response-time ms",
        {
          stream: serverRequestLoggerWriteStream,
        }
      )
    );

    // Security Middleware
    app.use(helmet());

    // Body Parser
    app.use(express.json());

    // Cookie Parser
    app.use(cookieParser());

    // CORS
    app.use(
      cors({
        origin: FRONTEND_SERVER_URL,
        credentials: true,
      })
    );

    // Routes
    app.use("/auth", authRouter);
    app.use("/task", taskRouter);

    // Server Request Logs
    app.get("/log0", (req, res) => {
      return res.sendFile(
        path.join(__dirname, "ServerRequests.log")
      );
    });

    app.use(
      "/log1",
      express.static(path.join(__dirname, "ServerRequests.log"))
    );

    // Start Server
    app.listen(PORT, () => {
      console.log("Server Started Listening");
    });
  } catch (error) {
    console.log(error);
  }
})();