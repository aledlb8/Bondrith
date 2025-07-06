import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  User,
} from "discord.js";
import helpers from "../../../../helpers";
import userModel from "../../../../models/user";

export default async function createUser(
  interaction: ChatInputCommandInteraction,
) {
  const user: User | null = interaction.options.getUser("user");
  if (user?.bot) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Bots can't own a copy"),
      ],
      ephemeral: true,
    });
  }
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "You don't have permission to use this subcommand.",
      ephemeral: true,
    });
  }
  try {
    const userCheck = await userModel.findOne({ discordId: user?.id });
    if (userCheck) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription(
              `That user already owns a ${process.env.NAME} copy`,
            ),
        ],
        ephemeral: true,
      });
    }
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
    userModel
      .countDocuments({})
      .then(async (count: number) => {
        nextId = count + 1;
        new userModel({ id: nextId, secret, discordId: user?.id }).save();
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
      .catch(() => {
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
  } catch {
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
}
