import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { SlashCommand } from "../../../types";
import userModel, { IUser } from "../../models/user";
import helpers from "../../helpers";

const command: SlashCommand = {
  enable: true,
  command: new SlashCommandBuilder()
    .setName("userlist")
    .setDescription("Get all the user infos")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction) => {
    try {
      const data = await userModel.find();

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

      const embedDetails = data
        .map((info: IUser) => {
          return [
            `ID: \`${info.id?.toString() ?? 'N/A'}\``,
            `User: <@${info.discordId ?? '1108168493548961793'}>`,
            //@ts-ignore
            `Created: ${info.createdAt ? `<t:${Math.floor(info.createdAt / 1000)}:R>` : 'N/A'}`,
            
          ].join("\n");
        })
        .join("\n\n");

      const embed = new EmbedBuilder()
        .setTitle("Users")
        .setDescription(embedDetails)
        .setColor("#FBC630");
      return interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (err) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Internal server error while getting users"),
        ],
        ephemeral: true,
      });
    }
  },
  cooldown: 3,
};

export default command;