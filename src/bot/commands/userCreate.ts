import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits, User,
} from "discord.js";
import { SlashCommand } from "../../../types";
import helpers from "../../helpers";
import userModel from "../../models/user";

const command: SlashCommand = {
  enable: true,
  command: new SlashCommandBuilder()
    .setName("usercreate")
    .setDescription("Create a user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user getting the account created")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction) => {
    const user: User | null = interaction.options.getUser("user");

    try {
      const userCheck = await userModel.findOne({ discordId: user?.id });

      if (userCheck)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription(`That user already owns a ${process.env.NAME} copy`),
          ],
          ephemeral: true,
        });

      const data = helpers.crypto.genUserInfo();

      if (!data) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Internal server error while generating user info"),
          ],
          ephemeral: true,
        });
      }

      const userId: string = helpers.crypto.encrypt(data.id);
      const userToken: string = helpers.crypto.encrypt(data.token);

      if (!userId || !userToken) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Internal server error while encrypting user info"),
          ],
          ephemeral: true,
        });
      }

      const secret: string | undefined = helpers.jwt.generate(userId, userToken);

      let nextId: number;

      userModel.countDocuments({})
        .then((count: number) => {
          const nextId = count + 1;

          new userModel({
            id: nextId,
            secret,
            discordId: user?.id,
          }).save()

          user?.send({
            embeds: [
              new EmbedBuilder()
                .setColor("#FBC630")
                .setTimestamp()
                .setDescription(`Id: \`${data.id}\`\nToken: \`${data.token}\``),
            ],
          });

          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("#FBC630")
                .setTimestamp()
                .setDescription(`Id: \`${data.id}\`\nToken: \`${data.token}\``),
            ],
            ephemeral: true,
          });
        })
        .catch((err: any) => {
          console.error(err);
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setColor("#FBC630")
                .setTimestamp()
                .setDescription("Internal server error while counting documents"),
            ],
            ephemeral: true,
          });
        });

      return;
    } catch (err) {
      console.log(err)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Internal server error while creating user"),
        ],
        ephemeral: true,
      });
    }
  },
  cooldown: 3,
};

export default command;