// import packages
import cookieParser from "cookie-parser";
import compression from "compression";
import express from "express";
import helmet from "helmet";
import cors from "cors";

// import utilities
import helpers from "./helpers";

// import routes
import userRoute from "./routes/user";

helpers
  .startup()
  .then(() => {
    // initialize
    const app = express();

    // set up routes
    app.use("/api/user", userRoute);

    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
    });

    app.use(cookieParser());
    app.use(compression());
    app.use(helmet());
    app.use(cors({ origin: "*" }));

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    app.listen(process.env.PORT, () => {
      helpers.consola.success("Server started");
    });

    helpers.consola.info("Starting bot...");
    require("./bot");

    process.on("uncaughtException", (err) => {
      helpers.consola.error(err);
    });
  })
  .catch((err) => {
    helpers.consola.error(err);
  });
