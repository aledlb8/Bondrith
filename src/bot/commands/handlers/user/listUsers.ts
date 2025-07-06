import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import userModel from "../../../../models/user";

export default async function listUsers(
  interaction: ChatInputCommandInteraction,
) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "You don't have permission to use this subcommand.",
      ephemeral: true,
    });
  }
  try {
    const data = await userModel.find();
    if (!data.length) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Database appears to me empty"),
        ],
        ephemeral: true,
      });
    }
    const embedDetails = data
      .map((info) => {
        return [
          `ID: \`${info.id?.toString() ?? "N/A"}\``,
          `User: <@${info.discordId ?? "1108168493548961793"}>`,
          //@ts-ignore
          `Created: ${info.createdAt ? `<t:${Math.floor(info.createdAt / 1000)}:R>` : "N/A"}`,
        ].join("\n");
      })
      .join("\n\n");
    const embed = new EmbedBuilder()
      .setTitle("Users")
      .setDescription(embedDetails)
      .setColor("#FBC630");
    return interaction.reply({ embeds: [embed], ephemeral: true });
  } catch {
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
}
