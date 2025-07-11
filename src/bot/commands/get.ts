import {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { SlashCommand } from "../../../types";
import helpers from "../../helpers";
import userModel from "../../models/user";

const command: SlashCommand = {
  enable: true,
  command: new SlashCommandBuilder()
    .setName("get")
    .setDescription("Get your ID and TOKEN"),
  execute: async (interaction: ChatInputCommandInteraction) => {
    try {
      const user = await userModel.findOne({ discordId: interaction.user.id });

      const btn = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL(process.env.PURCHASE_URL)
        .setLabel("Purchase");

      if (!user)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription(
                `Uh oh! you don't have a ${process.env.NAME} account`,
              ),
          ],
          components: [new ActionRowBuilder().addComponents(btn) as any],
          ephemeral: true,
        });

      const secret = helpers.jwt.verify(user.secret);

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

      const userId: string = helpers.crypto.decrypt(secret.data?.userId);
      const userToken: string = helpers.crypto.decrypt(secret.data?.userToken);

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription(`ID: \`${userId}\`\nToken: \`${userToken}\``),
        ],
        ephemeral: true,
      });
    } catch (err) {
      console.log(err);
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Internal server error while getting user info"),
        ],
        ephemeral: true,
      });
    }
  },
  cooldown: 3,
};

export default command;
