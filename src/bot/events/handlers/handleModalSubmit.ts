import { ModalSubmitInteraction } from "discord.js";
import handleKeyDeletion from "./modal/handleKeyDeletion";
import handleKeyRedemption from "./modal/handleKeyRedemption";
import handleDiscordUpdate from "./modal/handleDiscordUpdate";

export default async function handleModalSubmit(
  interaction: ModalSubmitInteraction
) {
  const customId = interaction.customId;
  switch (customId) {
    case "deletekey":
      await handleKeyDeletion(interaction);
      break;
    case "redeem":
      await handleKeyRedemption(interaction);
      break;
    case "discordupdate":
      await handleDiscordUpdate(interaction);
      break;
    default:
      break;
  }
}
