import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  CommandInteraction,
} from "discord.js";
import { SlashCommand } from "../../../types";
import createKey from "./handlers/key/createKey";
import showDeleteKeyModal from "./handlers/key/showDeleteKeyModal";
import listKeys from "./handlers/key/listKeys";

const command: SlashCommand = {
  enable: true,
  command: new SlashCommandBuilder()
    .setName("key")
    .setDescription("Manage keys")
    .addSubcommand((sub) =>
      sub.setName("create").setDescription("Create a key"),
    )
    .addSubcommand((sub) =>
      sub.setName("delete").setDescription("Delete a key"),
    )
    .addSubcommand((sub) => sub.setName("list").setDescription("List all keys"))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  execute: async (interaction: CommandInteraction) => {
    const sub = interaction.options.getSubcommand();
    switch (sub) {
      case "create":
        await createKey(interaction);
        break;
      case "delete":
        await showDeleteKeyModal(interaction);
        break;
      case "list":
        await listKeys(interaction);
        break;
      default:
        break;
    }
  },
  cooldown: 3,
};

export default command;
