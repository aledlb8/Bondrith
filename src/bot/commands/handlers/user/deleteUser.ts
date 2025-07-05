import { CommandInteraction, EmbedBuilder, PermissionFlagsBits, User } from "discord.js";
import userModel from "../../../models/user";

export default async function deleteUser(interaction: CommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: "You don't have permission to use this subcommand.", ephemeral: true });
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
    data.deleteOne();
    user?.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Your account has been deleted"),
      ],
    });
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("User deleted"),
      ],
      ephemeral: true,
    });
  } catch {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Internal server error while deleting user"),
      ],
      ephemeral: true,
    });
  }
}
