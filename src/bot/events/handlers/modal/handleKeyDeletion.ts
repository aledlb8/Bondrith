import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import keyModel from "../../../../models/key";
import helpers from "../../../../helpers";

export default async function handleKeyDeletion(
  interaction: ModalSubmitInteraction
) {
  const key = interaction.fields.getTextInputValue("keyInput");

  try {
    const keys = await keyModel.find();

    for (const data of keys) {
      const decryptedKey: string = helpers.crypto.decrypt(data.key);
      if (decryptedKey !== key) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Key not found"),
          ],
          ephemeral: true,
        });
      }

      await data.deleteOne();
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Key deleted"),
        ],
        ephemeral: true,
      });
    }

    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Key not found"),
      ],
      ephemeral: true,
    });
  } catch (err) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Internal server error while deleting key"),
      ],
      ephemeral: true,
    });
  }
}
