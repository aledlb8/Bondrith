import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { VerificationResult } from "../../../../../types";
import userModel from "../../../../models/user";
import helpers from "../../../../helpers";

export default async function handleDiscordUpdate(
  interaction: ModalSubmitInteraction,
) {
  const id = interaction.fields.getTextInputValue("accountId");

  try {
    const data: VerificationResult = await helpers.verify.verifyId(id);

    if (!data?.success) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription(data.message),
        ],
        ephemeral: true,
      });
    }

    if (data.discordData.id === interaction.user.id) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription(
              `This discord account is already linked to your ${process.env.NAME} account`,
            ),
        ],
        ephemeral: true,
      });
    }

    const user = await userModel.findOne({
      discordId: data.discordData.id,
    });

    if (!user) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Internal server error while finding user"),
        ],
        ephemeral: true,
      });
    }

    user.discordId = interaction.user.id;
    user.save();

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Discord account updated"),
      ],
      ephemeral: true,
    });
    return;
  } catch (err) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription(
            "Internal server error while updating discord account",
          ),
      ],
      ephemeral: true,
    });
    return;
  }
}
