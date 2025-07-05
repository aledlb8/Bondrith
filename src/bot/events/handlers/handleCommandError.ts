import { EmbedBuilder } from "discord.js";
import helpers from "../../../helpers";

export default async function handleCommandError(interaction: any, error: any) {
  helpers.consola.error(error);
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("#FBC630")
        .setTimestamp()
        .setDescription("Something went wrong!"),
    ],
  });
}
