import {
    SlashCommandBuilder,
    EmbedBuilder,
    CommandInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
} from "discord.js";
import { SlashCommand } from "../../../types";

const command: SlashCommand = {
    enable: true,
    command: new SlashCommandBuilder()
        .setName("userupdate")
        .setDescription("Update your account discord"),
    execute: async (interaction: CommandInteraction) => {
        try {
            const modal = new ModalBuilder()
                .setCustomId("discordupdate")
                .setTitle("Update you account discord");

            const keyInput = new TextInputBuilder()
                .setCustomId("accountId")
                .setLabel("Account ID")
                .setStyle(TextInputStyle.Short)
                .setMaxLength(16)
                .setMinLength(16)
                .setPlaceholder("XXXXXXXXXXXXXXXX")
                .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(keyInput);

            modal.addComponents(actionRow as any);
            await interaction.showModal(modal);
        } catch (err) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor("#FBC630")
                        .setTimestamp()
                        .setDescription("Internal server error"),
                ],
                ephemeral: true,
            });
        }
    },
    cooldown: 10,
};

export default command;