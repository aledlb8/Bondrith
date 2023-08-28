// import packages
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import rateLimit from 'express-rate-limit';

// import utilites
import helpers from "./helpers";

// import routes
import userRoute from "./routes/user"

// initialize
const app = express();
dotenv.config();

helpers.consola.info("Connecting to database");

// connect to database
mongoose.connect(process.env.MONGO_URI||"");
mongoose.set("strictQuery", true)

const db = mongoose.connection;

db.on('error', (err) => helpers.consola.error(`Database error: ${err}`));
db.once('open', () => helpers.consola.success("Database loaded"));

const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // limit each IP to 15 requests per windowMs
  message: 'Too many requests, please try again later'
});

helpers.consola.info("Starting middlewares");

// set up routes
app.use('/api/user', userRoute);

// set up middlewares
app.use(compression());
app.use(helmet());
app.use(cors());

// Apply the rate limiter to all routes
app.use(rateLimiter);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(process.env.PORT, () => {
    helpers.consola.success("Server loaded");
})

helpers.consola.info("Starting bot");
require("./bot")

// env checks
if (!process.env.ENCRYPT_KEY || typeof process.env.ENCRYPT_KEY !== 'string' || process.env.ENCRYPT_KEY.length !== 32) {
  console.log('ENCRYPT_KEY is not defined or not of valid type or length');
}

if (!process.env.JWT_SECRET || typeof process.env.JWT_SECRET !== 'string' || process.env.JWT_SECRET.length !== 32) {
  console.log('JWT_SECRET is not defined or not of valid type or length');
}

if (!process.env.AUTH_TOKEN || typeof process.env.AUTH_TOKEN !== 'string' || process.env.AUTH_TOKEN.length !== 32) {
  console.log('AUTH_TOKEN is not defined or not of valid type or length');
}