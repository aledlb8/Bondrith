import userModel from "../../models/user";
import keyModel from "../../models/key";
import helpers from "..";

class verify {
  private static async verifyUser(user: any) {
    const data = helpers.jwt.verify(user.secret);

    if (!data?.success || !data.data) {
      return { success: false, message: data?.message };
    }

    const userId = helpers.crypto.decrypt(data.data.userId);
    const userToken = helpers.crypto.decrypt(data.data.userToken);

    try {
      const res = await helpers.discord.getInfoByID(user.discordId);

      if (!res?.data) {
        return { success: false, message: "Invalid discordId" };
      }

      return { success: true, userId, userToken, discordData: res.data };
    } catch (error) {
      helpers.consola.error(error);
      return { success: false, message: "Error verifying user" };
    }
  }

  static async verifyId(id: string) {
    if (id.length !== 16) return { success: false, message: "Invalid id" };

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

  static async verifyToken(token: string) {
    if (token.length !== 64) return { success: false, message: "Invalid token" };

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

  static async verifyKey(key: string) {
    if (key.length !== 24) return { success: false, message: "Invalid key" };

    const keys = await keyModel.find();

    const foundKeyData = keys.find((data) => {
      const keyData = helpers.crypto.decrypt(data.key);
      return keyData === key && helpers.pkv.verify(key);
    });

    return foundKeyData
      ? { success: true, message: "Valid key" }
      : { success: false, message: "Invalid key" };
  }
}

export default verify;