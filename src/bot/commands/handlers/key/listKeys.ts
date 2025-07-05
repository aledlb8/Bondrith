import { CommandInteraction, EmbedBuilder } from "discord.js";
import keyModel from "../../../models/key";
import helpers from "../../../helpers";

export default async function listKeys(interaction: CommandInteraction) {
  try {
    const data = await keyModel.find();
    if (!data.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Database appears to me empty"),
        ],
        ephemeral: true,
      });
    }
    const embedDetails = data
      .map((info) => {
        return [
          `Key: \`${helpers.crypto.decrypt(info.key) ?? 'N/A'}\``,
          `Used: \`${info.used ?? 'N/A'}\``,
          //@ts-ignore
          `Created: ${info.createdAt ? `<t:${Math.floor(info.createdAt / 1000)}:R>` : 'N/A'}`,
        ].join("\n");
      })
      .join("\n\n");
    const embed = new EmbedBuilder()
      .setTitle("Keys")
      .setDescription(embedDetails)
      .setColor("#FBC630");
    return interaction.reply({ embeds: [embed], ephemeral: true });
  } catch {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Internal server error while getting keys"),
      ],
      ephemeral: true,
    });
  }
}
