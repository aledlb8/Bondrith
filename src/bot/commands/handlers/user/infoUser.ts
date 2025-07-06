import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
  User,
} from "discord.js";
import userModel from "../../../../models/user";
import helpers from "../../../../helpers";

export default async function infoUser(
  interaction: ChatInputCommandInteraction,
) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "You don't have permission to use this subcommand.",
      ephemeral: true,
    });
  }
  const user: User | null = interaction.options.getUser("user");
  try {
    const data = await userModel.findOne({ discordId: user?.id });
    if (!data) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription(`User not found`),
        ],
        ephemeral: true,
      });
    }
    const userId = helpers.crypto.userId(data.secret);
    const userToken = helpers.crypto.userToken(data.secret);
    if (!userId || !userToken) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Invalid secret"),
        ],
        ephemeral: true,
      });
    }
    const description = [
      `● **Account Information**`,
      `ID: \`${data.id?.toString() ?? "N/A"}\``,
      `UserID: \`${userId ?? "N/A"}\``,
      `UserToken: \`${userToken ?? "N/A"}\``,
      //@ts-ignore
      `Created: ${data.createdAt ? `<t:${Math.floor(data.createdAt / 1000)}:R>` : "N/A"}`,
      `● **User Information**`,
      `User: <@${data.discordId ?? "1108168493548961793"}>`,
      `IP: \`${data.ip ?? "N/A"}\``,
      `HWID: \`${data.hwid ?? "N/A"}\``,
    ];
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription(description.join("\n")),
      ],
      ephemeral: true,
    });
  } catch {
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
}
