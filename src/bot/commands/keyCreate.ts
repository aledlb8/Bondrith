import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { SlashCommand } from "../../../types";
import helpers from "../../helpers";
import keyModel from "../../models/key";

const command: SlashCommand = {
  enable: true,
  command: new SlashCommandBuilder()
    .setName("keycreate")
    .setDescription("Create a key")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction) => {
    try {
      const data: string = helpers.crypto.genKey();

      if (!data)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Internal server error"),
          ],
          ephemeral: true,
        });

      const key: string = helpers.crypto.encrypt(data);

      if (!key)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Internal server error"),
          ],
          ephemeral: true,
        });

      await new keyModel({
        key,
      }).save();

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription(`Key: \`${data}\``),
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
  cooldown: 3,
};

export default command;