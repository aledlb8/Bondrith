import {NextFunction, Request, Response} from "express";
import helpers from "../helpers";
import {DiscordUserInfo} from "../../types";

class validation {
  static async requireAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const ip: String = req.ip.split(":").pop() || "0.0.0.0";

      // @ts-ignore
      const account: DiscordUserInfo = await helpers.discord.getInfoByIP(ip);
      const identifier = account?.success ? account.data.username : ip;

      helpers.consola.debug(`Accessing website: ${identifier}`);

      let token: string | undefined = req.headers.cookie;
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

      const userId: string = helpers.crypto.decrypt(data.data.userId);
      const userToken: string = helpers.crypto.decrypt(data.data.userToken);

      // @ts-ignore
      req.user = {
        userId,
        userToken,
      }
      next();
    } catch (error) {
      helpers.consola.error(error)
    }
  };

  static async validateAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const ip: string = req.ip.split(":").pop() || "0.0.0.0";

      const account: DiscordUserInfo = await helpers.discord.getInfoByIP(ip);
      const identifier = account?.success ? account.data.username : ip;

      helpers.consola.debug(`Processing request: ${identifier}`);

      // Get the authorization token from the header
      const authToken: string | undefined = req.headers["authorization"];

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