import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";
import userModel from "../../../../models/user";

export default async function updateUser(
  interaction: ChatInputCommandInteraction,
) {
  const user = await userModel.findOne({ discordId: interaction.user.id });
  if (user) {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription(
            `Uh oh! you already have a ${process.env.NAME} account linked`,
          ),
      ],
      ephemeral: true,
    });
  }
  try {
    const modal: ModalBuilder = new ModalBuilder()
      .setCustomId("discordupdate")
      .setTitle("Update you account discord");
    const keyInput: TextInputBuilder = new TextInputBuilder()
      .setCustomId("accountId")
      .setLabel("Account ID")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(16)
      .setMinLength(16)
      .setPlaceholder("XXXXXXXXXXXXXXXX")
      .setRequired(true);
    const actionRow = new ActionRowBuilder().addComponents(keyInput);
    modal.addComponents(actionRow as any);
    return await interaction.showModal(modal);
  } catch {
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Internal server error while updating user"),
      ],
      ephemeral: true,
    });
  }
}
