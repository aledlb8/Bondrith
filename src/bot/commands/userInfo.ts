import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { SlashCommand } from "../../../types";
import helpers from "../../helpers";
import userModel from "../../models/user";

const command: SlashCommand = {
  enable: true,
  command: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get the info of a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user where you getting the info from")
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

      const secret = helpers.jwt.verify(data.secret);

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
            .setDescription(
              `ID: \`${data.id}\`\nUserId: \`${userId}\`\nUserToken: \`${userToken}\`\nIP: \`${data.ip}\`\nHWID: \`${data.hwid}\`\nUser: \<@${data.discordId}>\nCreatedAt: \`${data.createdAt}\``
            ),
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
