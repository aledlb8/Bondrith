import {
  CommandInteraction,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from "discord.js";

export default async function showDeleteKeyModal(
  interaction: CommandInteraction,
) {
  try {
    const modal: ModalBuilder = new ModalBuilder()
      .setCustomId("deletekey")
      .setTitle("Delete a key");

    const keyInput = new TextInputBuilder()
      .setCustomId("keyInput")
      .setLabel("Key to delete")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(24)
      .setMinLength(24)
      .setPlaceholder("XXXX-XXXX-XXXX-XXXX-XXXX")
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
          .setDescription("Internal server error while generating modal"),
      ],
      ephemeral: true,
    });
  }
}
