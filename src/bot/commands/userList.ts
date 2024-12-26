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

      //         ● **Account Information**
      // > ID: ${user.id?.toString() ?? 'N/A'}
      // > UserID: \`${userId(user.secret) ?? 'N/A'}\`
      // > UserToken: \`${userToken(user.secret) ?? 'N/A'}\`
      // > Created at: ${user.createdAt ? `<t:${Math.floor(user.createdAt / 1000)}:R>` : 'N/A'}
      // ● **User Information**
      // > User: <@${user.discordId ?? '1108168493548961793'}>
      // > IP: ${user.ip ?? 'N/A'}
      // > HWID: ${user.hwid ?? 'N/A'}

      const embedDetails = data
        .map((info: IUser) => {
          return [
            `● **Account Information**`,
            `ID: \`${info.id?.toString() ?? 'N/A'}\``,
            `UserID: \`${helpers.crypto.userId(info.secret) ?? 'N/A'}\``,
            `UserToken: \`${helpers.crypto.userToken(info.secret) ?? 'N/A'}\``,
            //@ts-ignore
            `Created: ${info.createdAt ? `<t:${Math.floor(info.createdAt / 1000)}:R>` : 'N/A'}`,
            `● **User Information**`,
            `User: <@${info.discordId ?? '1108168493548961793'}>`,
            `IP: \`${info.ip ?? 'N/A'}\``,
            `HWID: \`${info.hwid ?? 'N/A'}\``,
          ].join("\n");
        })
        .join("\n\n");

      const embed = new EmbedBuilder()
        .setTitle("Keys")
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