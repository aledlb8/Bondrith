import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import helpers from "../../../../helpers";
import keyModel from "../../../../models/key";

export default async function createKey(
  interaction: ChatInputCommandInteraction,
) {
  try {
    const data: string = helpers.crypto.genKey();
    if (!data) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Internal server error while generating key"),
        ],
        ephemeral: true,
      });
    }
    const key: string = helpers.crypto.encrypt(data);
    if (!key) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Internal server error while encrypting key"),
        ],
        ephemeral: true,
      });
    }
    await new keyModel({ key }).save();
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription(`Key: \`${data}\``),
      ],
      ephemeral: true,
    });
  } catch {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Internal server error while creating key"),
      ],
      ephemeral: true,
    });
  }
}
