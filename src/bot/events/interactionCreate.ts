import { Interaction } from "discord.js";
import { BotEvent } from "../../../types";
import handleChatInputCommand from "./handlers/handleChatInputCommand";
import handleContextMenu from "./handlers/handleContextMenu";
import handleAutocomplete from "./handlers/handleAutocomplete";
import handleModalSubmit from "./handlers/handleModalSubmit";

const event: BotEvent = {
  enable: true,
  name: "interactionCreate",
  execute: async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleChatInputCommand(interaction);
    } else if (interaction.isAutocomplete()) {
      handleAutocomplete(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction);
    } else if (interaction.isContextMenuCommand()) {
      await handleContextMenu(interaction);
    }
  },
};

export default event;
