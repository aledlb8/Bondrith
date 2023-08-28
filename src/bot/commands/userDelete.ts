import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { SlashCommand } from "../../../types";
import userModel from "../../models/user";

const command: SlashCommand = {
  enable: true,
  command: new SlashCommandBuilder()
    .setName("userdelete")
    .setDescription("Delete a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user getting deleted")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction) => {
    const user = interaction.options.getUser("user");

    try {
      const data = await userModel.findOne({ discordId: user?.id });

      if (!data)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription(`User not found`),
          ],
          ephemeral: true,
        });

      data.delete();

      user?.send({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Your account has been deleted"),
        ],
      });
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("User deleted"),
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