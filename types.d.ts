import {
  SlashCommandBuilder,
  CommandInteraction,
  Collection,
  PermissionResolvable,
  Message,
  AutocompleteInteraction,
} from "discord.js";

export interface SlashCommand {
  enable: boolean;
  command: SlashCommandBuilder | any;
  execute: (interaction: CommandInteraction) => void;
  autocomplete?: (interaction: AutocompleteInteraction) => void;
  cooldown?: number; // in seconds
}

export interface BotEvent {
  name: string;
  enable: boolean;
  once?: boolean | false;
  execute: (...args) => void;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number;
      NAME: string;
      VERSION: string;
      PURCHASE_URL: string;
      HWID_RESET_PLACEHOLDER: string;
      JWT_SECRET: string;
      ENCRYPT_KEY: string;
      AUTH_TOKEN: string;
      TOKEN: string;
      CLIENT_ID: string;
      GUILD_ID: string;
      WEBHOOK: string;
      MONGO_URI: string;
    }
  }
}

declare module "discord.js" {
  export interface Client {
    commands: Collection<string, SlashCommand>;
    cooldowns: Collection<string, number>;
  }
}