import { Client } from "discord.js";
import { BotEvent } from "../../../types";
import helpers from "../../helpers";

const event: BotEvent = {
  enable: true,
  name: "ready",
  once: true,
  execute: (client: Client) => {
    helpers.consola.success(
      `Logged in as ${client.user?.tag} (${client.user?.id})`
    );
  },
};

export default event;
