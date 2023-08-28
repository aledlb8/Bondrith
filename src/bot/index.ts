import { Client, GatewayIntentBits, Collection, PresenceUpdateStatus, Partials, ActivityType } from "discord.js";
const { Guilds, MessageContent, GuildMessages, GuildMembers, GuildVoiceStates } = GatewayIntentBits

const client = new Client({
    presence:{ 
        activities: [
            {
                name: process.env.NAME,
                type: ActivityType.Watching,

            }
        ],
        status: PresenceUpdateStatus.Online,
    },
    intents:[
        Guilds,
        MessageContent,
        GuildMessages,
        GuildMembers,
        GuildVoiceStates
    ],
    partials: [Partials.User, Partials.Message, Partials.Reaction],
    allowedMentions: { repliedUser: false}
})

import { SlashCommand } from "../../types";
import { readdirSync } from "fs";
import { join } from "path";

client.commands = new Collection<string, SlashCommand>()
client.cooldowns = new Collection<string, number>()

const handlersDir = join(__dirname, "./handlers")
readdirSync(handlersDir).forEach(handler => {
    require(`${handlersDir}/${handler}`)(client)
})

client.login(process.env.TOKEN)