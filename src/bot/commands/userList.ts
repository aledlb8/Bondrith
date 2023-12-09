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

      let embeds = [];

      for (let i = 0; i < data.length; i++) {
        const license = data[i];
        embeds.push(helpers.utils.userListEmbed(license));
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
      //       `ID: \`${info.id}\``,
      //       `UserID: \`${userid(info.secret)}\``,
      //       `UserToken: \`${usertoken(info.secret)}\``,
      //       `IP: \`${info.ip}\``,
      //       `HWID: \`${info.hwid}\``,
      //       `User: <@${info.discordId}>`,
      //       `CreatedAt: \`${info.createdAt}\``,
      //     ].join("\n");
      //   })
      //   .join("\n\n");

      // const embed = new EmbedBuilder()
      //   .setTitle("Account Infos")
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