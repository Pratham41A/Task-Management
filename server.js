import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectMongoDb } from "./config/mongoDb.js";
import { authRouter } from "./route/authRoutes.js";
import { taskRouter } from "./route/taskRoutes.js";

const {json} = express || {};

(async function () {
  try {
    const { env: { FRONTEND_SERVER_URL, PORT } = {} } = process || {};

    await connectMongoDb();

    const app = express();

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

    // Start Server
    app.listen(PORT, function () {
      console.log("Server Started Listening");
    });
  } catch (error) {
    console.log(error);
  }
})();