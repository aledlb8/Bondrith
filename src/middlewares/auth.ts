import { Request, Response, NextFunction } from "express";
import helpers from "../helpers";

class validation {
  static async requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip.split(":").pop() || "0.0.0.0";

      // @ts-ignore
      const account = await helpers.discord.getInfoByIP(ip);
      const identifier = account?.success ? account.data.username : ip;

      helpers.consola.debug(`Accessing website: ${identifier}`);

      let token = req.headers.cookie;
      if (token) token = token.replace(/^.{4}/, "");

      if (!token) {
        helpers.consola.debug(`Not logged in: ${identifier}`);
        return res.redirect("/");
      }

      const data = helpers.jwt.verify(token);

      if (!data?.success || !data.data) {
        helpers.consola.debug(`Invalid token: ${identifier}`);
        return res.redirect("/");
      }

      const userId = helpers.crypto.decrypt(data.data.userId);
      const userToken = helpers.crypto.decrypt(data.data.userToken);

      const user = {
        userId,
        userToken,
      };

      // @ts-ignore
      req.user = user
      next();
    } catch (error) {
      helpers.consola.error(error)
    }
  };

  static async validateAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const ip = req.ip.split(":").pop() || "0.0.0.0";

      const account = await helpers.discord.getInfoByIP(ip);
      const identifier = account?.success ? account.data.username : ip;

      helpers.consola.debug(`Processing request: ${identifier}`);

      // Get the authorization token from the header
      const authToken = req.headers["authorization"];

      // If no token is provided, return a 401 error
      if (!authToken) {
        helpers.consola.debug(`No token provided: ${identifier}`);
        return res
          .status(401)
          .json({ message: "Unauthorized: No token provided" });
      }

      // Compare the provided token to the token in the .env file
      if (authToken !== process.env.AUTH_TOKEN) {
        helpers.consola.debug(`Invalid token: ${identifier}`);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }

      // If the token is valid, proceed to the next middleware or route handler
      next();
    } catch (error) {
      helpers.consola.error(error)
    }
  };
}

export default validation;