import { ContextMenuCommandInteraction } from "discord.js";
import { SlashCommand } from "../../../../types";
import handleCommandError from "./handleCommandError";

export default async function handleContextMenu(
  interaction: ContextMenuCommandInteraction,
) {
  const context: SlashCommand | undefined = interaction.client.commands.get(
    interaction.commandName,
  );
  if (!context || !context.enable) {
    return interaction.reply(
      "This feature is not available at the moment, please try again later.",
    );
  }

  try {
    context.execute(interaction);
    return;
  } catch (error: any) {
    await handleCommandError(interaction, error);
    return;
  }
}
