import { AutocompleteInteraction } from "discord.js";

export default function handleAutocomplete(
  interaction: AutocompleteInteraction,
) {
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }
  try {
    if (command.autocomplete) {
      command.autocomplete(interaction);
    }
  } catch (error) {
    console.error(error);
  }
}
