import mongoose from "mongoose";
import dotenv from "dotenv";
import helpers from "..";

const startup = async () => {
  helpers.consola.warn();
  helpers.consola.warn(
    "!! PRODUCT IS IN BETA AND SHOULD NOT BE USED IN PRODUCTION !!",
  );
  helpers.consola.warn();

  dotenv.config();

  const requiredEnvVars: string[] = [
    "PORT",
    "HWID_RESET_PLACEHOLDER",
    "JWT_SECRET",
    "ENCRYPT_KEY",
    "AUTH_TOKEN",
    "TOKEN",
    "CLIENT_ID",
    "GUILD_ID",
    "MONGO_URI",
  ];

  for (const requiredEnvVar of requiredEnvVars) {
    if (!process.env[requiredEnvVar]) {
      helpers.consola.error(
        `Missing required environment variable: "${requiredEnvVar}"`,
      );
    }
  }

  if (
    !process.env.ENCRYPT_KEY ||
    typeof process.env.ENCRYPT_KEY !== "string" ||
    process.env.ENCRYPT_KEY.length !== 32
  ) {
    helpers.consola.warn(
      "ENCRYPT_KEY is not defined or not of valid type or length",
    );
  }

  if (
    !process.env.JWT_SECRET ||
    typeof process.env.JWT_SECRET !== "string" ||
    process.env.JWT_SECRET.length !== 32
  ) {
    helpers.consola.warn(
      "JWT_SECRET is not defined or not of valid type or length",
    );
  }

  if (
    !process.env.AUTH_TOKEN ||
    typeof process.env.AUTH_TOKEN !== "string" ||
    process.env.AUTH_TOKEN.length !== 32
  ) {
    helpers.consola.warn(
      "AUTH_TOKEN is not defined or not of valid type or length",
    );
  }

  helpers.consola.info("Connecting to database...");

  // connect to database
  await mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => helpers.consola.success("Database connected"))
    .catch((err) => helpers.consola.error(`Database error: ${err}`));
};

export default startup;
