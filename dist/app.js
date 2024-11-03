"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const root_routes_1 = require("./routes/root.routes");
const validationError_1 = __importDefault(require("./errors/validationError"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "views"));
app.set("public", path_1.default.join(__dirname, "public"));
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
app.use("/api/v1", root_routes_1.RootRoutes);
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});
app.use((err, req, res, next) => {
    if (err.name === "ZodError") {
        const errors = (0, validationError_1.default)(err);
        res.status(err.status || 500).json({
            message: "Validation error. Invalid data provided",
            errors,
        });
    }
    else {
        res.status(err.status || 500).json({
            error: {
                message: err.message,
            },
        });
    }
});
exports.default = app;
