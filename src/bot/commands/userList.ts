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
      //             embeds.push(new EmbedBuilder().setTitle("Account infos").setDescription(`${infos.map(info => {
      //                 `**id:** <@${info.id}>\n**userId:** ${userid(info.secret)}\n**userToken:** ${usertoken(info.secret)}\n**User:** <@${info.discordId}>\n**createdAt:** ${info.createdAt}`}).join("\n\n ")}`).setColor("#FBC630"))
      //             infos.length = 0
      //         }
      //     }

      //     if(infos.length) embeds.push(new EmbedBuilder().setDescription(`${infos.map(info => {
      //         `**id:** <@${info.id}>\n**userId:** ${userid(info.secret)}\n**userToken:** ${usertoken(info.secret)}\n**User:** <@${info.discordId}>\n**createdAt:** ${info.createdAt}`}).join("\n\n")}`).setColor("#FBC630"))
      //     return interaction.followUp({ embeds: embeds })
      // }

      const embedDetails = data
        .map((info) => {
          return [
            `id: \`${info.id}\``,
            `userId: \`${userid(info.secret)}\``,
            `userToken: \`${usertoken(info.secret)}\``,
            `IP: \`${info.ip}\``,
            `HWID: \`${info.hwid}\``,
            `user: <@${info.discordId}>`,
            `createdAt: \`${info.createdAt}\``,
          ].join("\n");
        })
        .join("\n\n");

      const embed = new EmbedBuilder()
        .setTitle("Account Infos")
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

function userid(data: any) {
  const secret = helpers.jwt.verify(data);
  if (!secret?.data) return;
  const id = helpers.crypto.decrypt(secret?.data?.userId);
  return id;
}

function usertoken(data: any) {
  const secret = helpers.jwt.verify(data);
  if (!secret?.data) return;
  const token = helpers.crypto.decrypt(secret?.data?.userToken);
  return token;
}