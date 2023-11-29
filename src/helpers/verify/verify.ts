import userModel, { IUser } from "../../models/user";
import keyModel, { IKey } from "../../models/key";
import helpers from "..";
import { VerificationResult } from "../../../types";

class VerificationService {
  private static async verifyUser(user: IUser) {
    try {
      const decodedToken = helpers.jwt.verify(user.secret);

      if (!decodedToken?.success || !decodedToken.data) {
        return { success: false, message: decodedToken?.message || "Invalid token" };
      }

      const userId = helpers.crypto.decrypt(decodedToken.data.userId);
      const userToken = helpers.crypto.decrypt(decodedToken.data.userToken);

      const discordDataResult = await helpers.discord.getInfoByID(user.discordId);

      if (!discordDataResult?.data) {
        return { success: false, message: "Invalid discordId" };
      }

      return {
        success: true,
        userId,
        userToken,
        discordData: discordDataResult.data,
      };
    } catch (error) {
      helpers.consola.error(error);
      return { success: false, message: "Error verifying user" };
    }
  }

  static async verifyId(id: string): Promise<VerificationResult> {
    if (id.length !== 16) {
      return { success: false, message: "Invalid id" };
    }

    const users = await userModel.find();

    for (const user of users) {
      const result = await this.verifyUser(user);

      if (result.success && result.userId === id) {
        return {
          success: true,
          message: "Valid id",
          discordData: result.discordData,
          userToken: result.userToken,
        };
      }
    }

    return { success: false, message: "Invalid id" };
  }

  static async verifyToken(token: string): Promise<VerificationResult> {
    if (token.length !== 64) {
      return { success: false, message: "Invalid token" };
    }

    const users = await userModel.find();

    for (const user of users) {
      const result = await this.verifyUser(user);

      if (result.success && result.userToken === token) {
        return {
          success: true,
          message: "Valid token",
          hwid: user.hwid,
          discordData: result.discordData,
        };
      }
    }

    return { success: false, message: "Invalid token" };
  }

  static async verifyKey(key: string): Promise<VerificationResult> {
    if (key.length !== 24) {
      return { success: false, message: "Invalid key" };
    }

    const keys = await keyModel.find();

    const foundKeyData = keys.find((data: IKey) => {
      const decryptedKey = helpers.crypto.decrypt(data.key);
      return decryptedKey === key && helpers.pkv.verify(key);
    });

    return foundKeyData
      ? { success: true, message: "Valid key" }
      : { success: false, message: "Invalid key" };
  }
}

export default VerificationService;