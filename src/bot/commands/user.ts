import {
  SlashCommandBuilder,
  CommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { SlashCommand } from "../../../types";
import createUser from "./handlers/user/createUser";
import deleteUser from "./handlers/user/deleteUser";
import infoUser from "./handlers/user/infoUser";
import listUsers from "./handlers/user/listUsers";
import updateUser from "./handlers/user/updateUser";
import resetHwid from "./handlers/user/resetHwid";

const command: SlashCommand = {
  enable: true,
  command: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Manage users")
    .addSubcommand((sub) =>
      sub
        .setName("create")
        .setDescription("Create a user")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("The user getting the account created")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("delete")
        .setDescription("Delete a user")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("The user getting deleted")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName("info")
        .setDescription("Get the info of a user")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("The user where you getting the info from")
            .setRequired(true),
        ),
    )
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("Get all the user infos"),
    )
    .addSubcommand((sub) =>
      sub.setName("update").setDescription("Update your account discord"),
    )
    .addSubcommand((sub) =>
      sub
        .setName("resethwid")
        .setDescription("Reset the HWID of a user")
        .addUserOption((opt) =>
          opt
            .setName("user")
            .setDescription("The user getting the HWID reset")
            .setRequired(true),
        ),
    ),
  execute: async (interaction: CommandInteraction) => {
    const sub = interaction.options.getSubcommand();
    switch (sub) {
      case "create":
        await createUser(interaction);
        break;
      case "delete":
        await deleteUser(interaction);
        break;
      case "info":
        await infoUser(interaction);
        break;
      case "list":
        await listUsers(interaction);
        break;
      case "update":
        await updateUser(interaction);
        break;
      case "resethwid":
        await resetHwid(interaction);
        break;
      default:
        break;
    }
  },
  cooldown: 3,
};

export default command;
