import { Request, Response } from "express";
import userModel from "../models/user";
import helpers from "../helpers";
import { DiscordUserInfo, VerificationResult } from "../../types";

class userController {
  static async userLogin(req: Request, res: Response) {
    const ip: string = req.ip?.split(":").pop() || "0.0.0.0";

    try {
      const account: DiscordUserInfo = await helpers.discord.getInfoByIP(ip);
      const identifier = account?.success ? account.data.username : ip;

      const { userId } = req.params;

      if (!userId) {
        helpers.consola.debug(`Invalid request: ${identifier}`);
        return res
          .status(401)
          .send({ success: false, message: "Invalid request" });
      }

      const data: VerificationResult = await helpers.verify.verifyId(userId);

      if (!data?.success) {
        helpers.consola.debug(`${data.message}: ${identifier}`);
        return res.status(401).send({ success: false, message: data?.message });
      }

      const user = await userModel.findOne({
        discordId: data.discordData.id,
      });

      if (!user) {
        helpers.consola.debug(`Invalid discordId: ${identifier}`);
        return res
          .status(400)
          .send({ success: false, message: "Invalid discordId" });
      }

      if (user.ip !== ip) user.ip = ip;
      user.save();

      helpers.consola.debug(`Logged in: ${identifier}`);
      return res.status(200).send({
        success: true,
        message: "Logged in",
        data: data.discordData,
        userToken: data.userToken,
      });
    } catch (err: any) {
      helpers.consola.debug(`${err.code}: ${ip}`);
      return res
        .status(500)
        .send({ success: false, message: "Internal server error", err });
    }
  }

  static async userAccess(req: Request, res: Response) {
    const ip: string = req.ip?.split(":").pop() || "0.0.0.0";

    try {
      const account: DiscordUserInfo = await helpers.discord.getInfoByIP(ip);
      const identifier = account?.success ? account.data.username : ip;

      const { userToken } = req.params;
      const { hwid } = req.query;

      if (!userToken) {
        helpers.consola.debug(`Invalid request: ${identifier}`);
        return res
          .status(401)
          .send({ success: false, message: "Invalid request" });
      }

      const data: VerificationResult =
        await helpers.verify.verifyToken(userToken);

      if (!data?.success) {
        helpers.consola.debug(`${data.message}: ${identifier}`);
        return res.status(401).send({ success: false, message: data?.message });
      }

      const user = await userModel.findOne({
        discordId: data.discordData.id,
      });

      if (!user) {
        helpers.consola.debug(`Invalid discordId: ${identifier}`);
        return res
          .status(400)
          .send({ success: false, message: "Invalid discordId" });
      }

      if (user.ip !== ip) user.ip = ip;

      if (hwid) {
        if (
          data.hwid &&
          data.hwid !== process.env.HWID_RESET_PLACEHOLDER &&
          data.hwid !== hwid
        ) {
          helpers.consola.debug(`HWID mismatch: ${identifier}`);
          return res
            .status(400)
            .send({ success: false, message: "HWID mismatch" });
        }

        if (!data.hwid || data.hwid == process.env.HWID_RESET_PLACEHOLDER) {
          user.hwid = hwid.toString();
        }
      }

      user.save();
      helpers.consola.debug(`Access granted: ${identifier}`);
      return res.status(200).send({
        success: true,
        message: "Access granted",
        data: data.discordData,
      });
    } catch (err: any) {
      helpers.consola.debug(`${err.code}: ${ip}`);
      return res
        .status(500)
        .send({ success: false, message: "Internal server error", err });
    }
  }
}

export default userController;
