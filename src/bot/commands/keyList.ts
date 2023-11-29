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

      // const decryptedData = data.map(info => {
      //     return {
      //         ...info.toObject(),
      //         secret: all(info.secret),
      //     }
      // })

      // if(data.length > 3) {
      //     const embeds = []
      //     const infos = []
      //     for(let key of data) {
      //         infos.push(key)
      //         if(infos.length === 3) {
      //             embeds.push(new EmbedBuilder().setTitle("Keys").setDescription(`${infos.map(info => {
      //                 `**key:** ${info.key}\n**used:** ${info.used}\n**createdAt:** ${info.createdAt}`}).join("\n\n ")}`).setColor("#FBC630"))
      //             infos.length = 0
      //         }
      //     }

      //     if(infos.length) embeds.push(new EmbedBuilder().setDescription(`${infos.map(info => {
      //         `**key:** ${info.key}\n**used:** ${info.used}\n**createdAt:** ${info.createdAt}`}).join("\n\n")}`).setColor("#FBC630"))
      //     return interaction.followUp({ embeds: embeds })
      // }

      const embedDetails = data
        .map((info) => {
          return [
            `Key: \`${helpers.crypto.decrypt(info.key)}\``,
            `Used: \`${info.used}\``,
            `CreatedAt: \`${info.createdAt}\``,
          ].join("\n");
        })
        .join("\n\n");

      const embed = new EmbedBuilder()
        .setTitle("Keys")
        .setDescription(embedDetails)
        .setColor("#FBC630");
      interaction.reply({ embeds: [embed], ephemeral: true });
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
