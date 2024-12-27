import { Client, Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { readdirSync } from "fs";
import { join } from "path";
import { SlashCommand } from "../../../types";
import helpers from "../../helpers";

module.exports = (client: Client) => {
  const commands: SlashCommandBuilder[] = [];

  let commandsDir: string = join(__dirname, "../commands");

  readdirSync(commandsDir).forEach((file) => {
    if (!file.endsWith(".ts")) return;
    let command: SlashCommand = require(`${commandsDir}/${file}`).default;
    if (!command.enable) return;
    commands.push(command.command);
    client.commands.set(command.command.name, command);
  });

  const rest: REST = new REST({ version: "10" }).setToken(process.env.TOKEN);

//   rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] })
// 	.then(() => helpers.consola.success('Successfully deleted all application commands.'))
// 	.catch(console.error);

  rest
    .put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
      body: commands.map((command) => command.toJSON()),
    })
    .then((data: any) => {
      helpers.consola.success(`Loaded ${data.length} command(s)`)
    })
    .catch((e: any) => {
      helpers.consola.error(e);
    });
};