import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { SlashCommand } from "../../../types";
import keyModel from "../../models/key";
import helpers from "../../helpers";

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

      let embeds: any[] = [];

      // ● **Key Information**
      // > Key: ${helpers.crypto.decrypt(key.key) ?? 'N/A'}
      // > Used: ${key.used ?? 'N/A'}
      // > Created at: ${key.createdAt ? `<t:${Math.floor(key.createdAt / 1000)}:R>` : 'N/A'}
      
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

      // for (let i: number = 0; i < data.length; i++) {
      //   const key = data[i];
      //   embeds.push(data[i]);
      // }

      const embed = new EmbedBuilder()
        .setTitle("Keys")
        .setDescription(embedDetails)
        .setColor("#FBC630");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      console.log(err)
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
  },
  cooldown: 3,
};

export default command;