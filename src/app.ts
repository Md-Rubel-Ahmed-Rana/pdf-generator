import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { RootRoutes } from "./routes/root.routes";
import handleZodValidationError from "./errors/validationError";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use(morgan("dev"));

// application routes
app.use("/api/v1", RootRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    statusCode: 200,
    success: true,
    message: "PDF generator server is up and running!",
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === "ZodError") {
    const errors = handleZodValidationError(err);
    res.status(err.status || 500).json({
      message: "Validation error. Invalid data provided",
      errors,
    });
  } else {
    res.status(err.status || 500).json({
      error: {
        message: err.message,
      },
    });
  }
});

export default app;
