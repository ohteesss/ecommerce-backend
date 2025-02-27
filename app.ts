import { Request, Response, NextFunction } from "express";
import AppError from "./utils/appError";

import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { AppRequest } from "./types";
import router from "./routes";

const app = express();

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
  statusCode: 429,
});
app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));

app.use((req: AppRequest, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello from the server!",
    app: "e-commerce-api",
  });
});

app.use(router);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

export default app;
