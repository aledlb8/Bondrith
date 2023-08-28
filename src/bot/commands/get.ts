import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { SlashCommand } from "../../../types";
import helpers from "../../helpers";
import userModel from "../../models/user";

const command: SlashCommand = {
  enable: true,
  command: new SlashCommandBuilder()
    .setName("get")
    .setDescription("Get your ID and TOKEN"),
  execute: async (interaction) => {
    try {
      const user = await userModel.findOne({ discordId: interaction.user.id });

      if (!user)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription(`Purchase ${process.env.NAME} at ${process.env.PURCHASE_URL}`),
          ],
          ephemeral: true,
        });

      const secret = helpers.jwt.verify(user.secret);

      if (!secret?.success || !secret.data)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription(secret?.message as string),
          ],
          ephemeral: true,
        });

      const userId = helpers.crypto.decrypt(secret.data?.userId);
      const userToken = helpers.crypto.decrypt(secret.data?.userToken);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription(`Id: \`${userId}\`\nToken: \`${userToken}\``),
        ],
        ephemeral: true,
      });
    } catch (err) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Internal server error"),
        ],
        ephemeral: true,
      });
    }
  },
  cooldown: 10,
};

export default command;