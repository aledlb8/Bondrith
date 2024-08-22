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
import userModel from "../../models/user";

const command: SlashCommand = {
    enable: true,
    command: new SlashCommandBuilder()
        .setName("userupdate")
        .setDescription("Update your account discord"),
    execute: async (interaction: CommandInteraction) => {
        const user = await userModel.findOne({ discordId: interaction.user.id });

        try {
            if (user) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#FBC630")
                            .setTimestamp()
                            .setDescription(
                                `Uh oh! you already have a ${process.env.NAME} account linked`
                            ),
                    ],
                    ephemeral: true,
                });
            }

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
    cooldown: 3,
};

export default command;