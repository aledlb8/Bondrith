import helpers from "../index";
import userModel from "../../models/user";
import keyModel from "../../models/key";
import axios from "axios";

class verify {
  static async verifyId(id: string) {
    if (id.length !== 16) return { success: false, message: "Invalid id" };

    const users = await userModel.find();

    for (const user of users) {
      const data = helpers.jwt.verify(user.secret);

      if (!data?.success || !data.data)
        return { success: false, message: data?.message };

      const userId = helpers.crypto.decrypt(data.data.userId);
      const userToken = helpers.crypto.decrypt(data.data.userToken);

      try {
        const res = await axios({
          method: "GET",
          headers: { Authorization: `Bot ${process.env.TOKEN}` },
          url: `https://discord.com/api/v10/users/${user.discordId}`,
        });

        if (!res.data) return { success: false, message: "Invalid discordId" };

        if (userId == id)
          return {
            success: true,
            message: "Valid id",
            discordData: res.data,
            userToken,
          };
      } catch (error) {
        console.log(error);
      }
    }

    return { success: false, message: "Invalid id" };
  }

  static async verifyToken(token: string) {
    if (token.length !== 64)
      return { success: false, message: "Invalid token" };

    const users = await userModel.find();

    for (const user of users) {
      const data = helpers.jwt.verify(user.secret);

      if (!data?.success || !data.data)
        return { success: false, message: data?.message };

      const userToken = helpers.crypto.decrypt(data.data.userToken);

      const res = await axios({
        method: "GET",
        headers: { Authorization: `Bot ${process.env.TOKEN}` },
        url: `https://discord.com/api/v10/users/${user.discordId}`,
      });

      if (!res.data) return { success: false, message: "Invalid discordId" };

      if (userToken == token)
        return {
          success: true,
          message: "Valid token",
          hwid: user.hwid,
          discordData: res.data,
        };
    }

    return { success: false, message: "Invalid token" };
  }

  static async verifyKey(key: string) {
    if (key.length !== 24) return { success: false, message: "Invalid key" };

    const keys = await keyModel.find();

    for (const data of keys) {
      const keyData = helpers.crypto.decrypt(data.key);

      if (keyData == key) return { success: true, message: "Valid key" };
    }

    return { success: false, message: "Invalid key" };
  }
}

export default verify;
