import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits, User,
} from "discord.js";
import { SlashCommand } from "../../../types";
import userModel from "../../models/user";

const command: SlashCommand = {
  enable: true,
  command: new SlashCommandBuilder()
    .setName("reset")
    .setDescription("Reset the HWID of a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user getting the HWID reset")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction) => {
    const user: User | null = interaction.options.getUser("user");

    try {
      const userCheck = await userModel.findOne({ discordId: user?.id });

      if (!userCheck)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("User not found"),
          ],
          ephemeral: true,
        });

      if (!userCheck.hwid || userCheck.hwid == process.env.HWID_RESET_PLACEHOLDER)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("HWID is already reset"),
          ],
        });

      userCheck.hwid = process.env.HWID_RESET_PLACEHOLDER;
      userCheck.save();

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription(`Successfully reset HWID for: \`${user?.username}\``),
        ],
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
  cooldown: 3,
};

export default command;