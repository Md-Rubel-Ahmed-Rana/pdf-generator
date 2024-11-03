import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { RootRoutes } from "./routes/root.routes";
import handleZodValidationError from "./errors/validationError";

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// set the view engine to ejs
app.set("view engine", "ejs");

// read static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

// Set the path to the views directory
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/certificate/create", (req, res) => {
  res.render("certificate-create");
});

app.get("/resume/create", (req, res) => {
  res.render("resume-create");
});

// application routes
app.use("/api/v1", RootRoutes);

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
