import { Client } from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";
import { BotEvent } from "../../../types";
import helpers from "../../helpers";

module.exports = (client: Client) => {
  let eventsDir: string = join(__dirname, "../events");

  readdirSync(eventsDir).forEach((file: string) => {
    if (!file.endsWith(".ts")) return;
    let event: BotEvent = require(`${eventsDir}/${file}`).default;
    if (!event.enable) return;
    event.once
      ? client.once(event.name, (...args: any[]) => event.execute(...args))
      : client.on(event.name, (...args: any[]) => event.execute(...args));
  });

  helpers.consola.success(`Loaded ${readdirSync(eventsDir).length} event(s)`);
};
