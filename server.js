import "dotenv/config";
import express,{json,static as static_} from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import {createWriteStream} from "fs";
import {dirname,join} from "path";
import { fileURLToPath } from "url";

import { connectMongoDb } from "./config/mongoDb.js";
import { authRouter } from "./route/authRoutes.js";
import { taskRouter } from "./route/taskRoutes.js";

(async function () {
  try {
    const { env: { FRONTEND_SERVER_URL, PORT } = {} } = process || {};
    const { url } = import.meta || {}
    const __filename = fileURLToPath(url);
    const __dirname = dirname(__filename);

    await connectMongoDb();

    const app = express();

    // Server Request Logger
    const serverRequestLoggerWriteStream = createWriteStream(
      join(__dirname, "ServerRequests.log"),
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
    app.use(json());

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
    app.get("/log0", function (req, res) {
      return res.sendFile(
        join(__dirname, "ServerRequests.log")
      );
    });

    app.use(
      "/log1",
      static_(join(__dirname, "ServerRequests.log"))
    );

    // Start Server
    app.listen(PORT, function () {
      console.log("Server Started Listening");
    });
  } catch (error) {
    console.log(error);
  }
})();