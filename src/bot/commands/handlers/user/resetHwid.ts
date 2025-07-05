import { CommandInteraction, EmbedBuilder, PermissionFlagsBits, User } from "discord.js";
import userModel from "../../../models/user";

export default async function resetHwid(interaction: CommandInteraction) {
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: "You don't have permission to use this subcommand.", ephemeral: true });
  }
  const user: User | null = interaction.options.getUser("user");
  try {
    const userCheck = await userModel.findOne({ discordId: user?.id });
    if (!userCheck) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("User not found"),
        ],
        ephemeral: true,
      });
    }
    if (!userCheck.hwid || userCheck.hwid == process.env.HWID_RESET_PLACEHOLDER) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("HWID is already reset"),
        ],
        ephemeral: true,
      });
    }
    userCheck.hwid = process.env.HWID_RESET_PLACEHOLDER;
    userCheck.save();
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription(`Successfully reset HWID for: \`${user?.username}\``),
      ],
    });
  } catch {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Internal server error while resetting HWID"),
      ],
      ephemeral: true,
    });
  }
}
