import axios, { AxiosResponse } from "axios";
import userModel, { IUser } from "../../models/user";
import helpers from "..";
import { DiscordUserInfo } from "../../../types";

class DiscordService {
    static async getInfoByID(id: string): Promise<DiscordUserInfo> {
        try {
            const response: AxiosResponse | undefined = await this.fetchDiscordUser(id);

            if (!response) {
                return { success: false, message: "Invalid discordId" };
            }

            return { success: true, data: response.data };
        } catch (error) {
            this.handleError(error);
            return { success: false, message: "An error occurred" };
        }
    }

    static async getInfoByIP(ip: string): Promise<DiscordUserInfo> {
        try {
            const account: IUser | null = await userModel.findOne({ ip });

            if (!account) {
                return { success: false, message: "Invalid IP" };
            }

            const response: AxiosResponse | undefined = await this.fetchDiscordUser(account.discordId);

            if (!response) {
                return { success: false, message: "Invalid discordId" };
            }

            return { success: true, data: response.data };
        } catch (error) {
            this.handleError(error);
            return { success: false, message: "An error occurred" };
        }
    }

    private static async fetchDiscordUser(id: string): Promise<AxiosResponse | undefined> {
        try {
            return await axios({
                method: "GET",
                headers: { Authorization: `Bot ${process.env.TOKEN}` },
                url: `https://discord.com/api/v10/users/${id}`,
            });
        } catch (error) {
            this.handleError(error);
            return undefined;
        }
    }

    private static handleError(error: any): void {
        helpers.consola.error(error);
    }
}

export default DiscordService;