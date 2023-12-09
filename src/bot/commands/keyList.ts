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
    .setName("keylist")
    .setDescription("Get all the keys")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction) => {
    try {
      const data = await keyModel.find();

      if (!data.length)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Database appears to me empty"),
          ],
          ephemeral: true,
        });

      let embeds = [];

      for (let i = 0; i < data.length; i++) {
        const key = data[i];
        embeds.push(helpers.utils.keyListEmbed(key));
      }
      helpers.utils.paginationEmbed(
        interaction,
        ["◀️", "Back", "Next", "▶️"],
        embeds,
        "60s",
        false
      );

      // const embedDetails = data
      //   .map((info) => {
      //     return [
      //       `Key: \`${helpers.crypto.decrypt(info.key)}\``,
      //       `Used: \`${info.used}\``,
      //       `CreatedAt: \`${info.createdAt}\``,
      //     ].join("\n");
      //   })
      //   .join("\n\n");

      // const embed = new EmbedBuilder()
      //   .setTitle("Keys")
      //   .setDescription(embedDetails)
      //   .setColor("#FBC630");
      // interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.log(err)
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
