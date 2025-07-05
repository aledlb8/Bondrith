import { ChatInputCommandInteraction } from "discord.js";
import { SlashCommand } from "../../../../types";
import handleCommandError from "./handleCommandError";

export default async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction,
) {
  const command: SlashCommand | undefined = interaction.client.commands.get(
    interaction.commandName,
  );
  if (!command || !command.enable) {
    return interaction.reply(
      "This command is not available at the moment, please try again later.",
    );
  }

  const userCooldownKey = `${interaction.commandName}-${interaction.user.username}`;
  const cooldown = interaction.client.cooldowns.get(userCooldownKey);
  if (command.cooldown && cooldown && Date.now() < cooldown) {
    const remainingCooldown = Math.floor((cooldown - Date.now()) / 1000);
    await interaction.reply(
      `You have to wait ${remainingCooldown} second(s) to use this command again.`,
    );
    setTimeout(() => interaction.deleteReply(), 5000);
    return;
  }

  if (command.cooldown) {
    interaction.client.cooldowns.set(
      userCooldownKey,
      Date.now() + command.cooldown * 1000,
    );
    setTimeout(() => {
      interaction.client.cooldowns.delete(userCooldownKey);
    }, command.cooldown * 1000);
  }

  try {
    command.execute(interaction);
  } catch (error: any) {
    await handleCommandError(interaction, error);
  }
}
