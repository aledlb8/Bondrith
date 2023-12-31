// import packages
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";

// import utilities
import helpers from "./helpers";

// import routes
import userRoute from "./routes/user";

helpers.startup()
  .then(() => {
    // initialize
    const app = express();

    const db = mongoose.connection;

    db.on("error", (err) => helpers.consola.error(`Database error: ${err}`));
    db.once("open", () => helpers.consola.success("Database connected"));

    // set up routes
    app.use("/api/user", userRoute);

    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*")
    })

    app.use(cookieParser())
    app.use(compression());
    app.use(helmet());
    app.use(cors({ origin: "*" }));

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.listen(process.env.PORT, () => {
      helpers.consola.success("Server started");
    });

    helpers.consola.info("Starting bot");
    require("./bot");

    process.on("uncaughtException", (err) => {
      helpers.consola.error(err);
    });
  })
  .catch((err) => {
    helpers.consola.error(err)
  });