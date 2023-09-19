import userModel from "../../models/user";
import helpers from "..";
import axios from "axios";

class discord {
    static async getInfoByID(id: string) {
        try {
            const res = await axios({
                method: "GET",
                headers: { Authorization: `Bot ${process.env.TOKEN}` },
                url: `https://discord.com/api/v9/users/${id}`,
            });

            if (!res.data) return { success: false, message: "Invalid discordId" };

            return { success: true, data: res.data };
        } catch (error) {
            console.log(error)
            helpers.consola.error(error)
        }
    }
    static async getInfoByIP(ip: string) {
        try {
            const account = await userModel.findOne({
                ip,
            });

            if (!account) {
                return { success: false, message: "Invalid IP" };
            }

            const res = await axios({
                method: "GET",
                headers: { Authorization: `Bot ${process.env.TOKEN}` },
                url: `https://discord.com/api/v9/users/${account.discordId}`,
            });

            if (!res.data) return { success: false, message: "Invalid discordId" };

            return { success: true, data: res.data };
        } catch (error) {
            helpers.consola.error(error)
        }
    }
}

export default discord;