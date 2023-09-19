// import packages
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose";
import express from "express";
import helmet from "helmet";
import cors from "cors";

// import utilites
import helpers from "./helpers";

// import routes
import userRoute from "./routes/user";
import devRoute from "./routes/dev";
import path from "path";
import startup from "./helpers/startup";

startup()
  .then(() => {
    // initialize
    const app = express();

    const db = mongoose.connection;

    db.on("error", (err) => helpers.consola.error(`Database error: ${err}`));
    db.once("open", () => helpers.consola.success("Database connected"));

    // set up routes
    app.use("/api/user", userRoute);
    app.use("/", devRoute);

    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*")
    })

    // set up middlewares
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
      helpers.consola.error(
        `\x1b[31m* Port ${process.env.PORT} is already in use\x1b[0m`
      );
      helpers.consola.error(
        `\x1b[33m* Make sure to change port or shut down any other application\x1b[0m`
      );
    });
  })
  .catch((err) => {
    helpers.consola.error(err)
  });
