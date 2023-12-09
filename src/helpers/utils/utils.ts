import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, CommandInteraction, Interaction } from "discord.js";
import ms from "ms";
import helpers from "..";

class Utils {
    static async paginationEmbed(
        interaction: CommandInteraction,
        emojis: string[],
        embeds: EmbedBuilder[],
        timeout: string,
        ephemeral: boolean
    ) {
        if (embeds.length <= 0) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder().setTitle("No embeds to paginate!").setColor("#FF0000"),
                ],
                ephemeral: ephemeral,
            });
        }

        if (embeds.length === 1) {
            return interaction.reply({ embeds: [embeds[0]], ephemeral });
        }

        let current = 0;
        const row = (state: boolean) => [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setEmoji(emojis[0])
                    .setDisabled(state)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('btn1'),
                new ButtonBuilder()
                    .setLabel(emojis[1])
                    .setDisabled(state)
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("btn2"),
                new ButtonBuilder()
                    .setLabel(emojis[2])
                    .setDisabled(state)
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("btn3"),
                new ButtonBuilder()
                    .setEmoji(emojis[3])
                    .setDisabled(state)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("btn4")
            ),
        ];

        const curPage = await interaction.reply({
            embeds: [embeds[current].setTitle(`Total: ${embeds.length}`).setFooter({ text: `Page ${current + 1} of ${embeds.length}` })],
            components: row(false),
            fetchReply: true,
            ephemeral,
        }) as any;

        const collector = curPage.createMessageComponentCollector({
            filter: (m: any) => m.user.id === interaction.user.id,
            componentType: "BUTTON",
            time: ms(timeout),
        });

        collector.on("collect", async (collected: any) => {
            if (collected.customId === "btn1") current = 0;
            else if (collected.customId === "btn2") current--;
            else if (collected.customId === "btn3") current++;
            else if (collected.customId === "btn4") current = embeds.length - 1;

            if (current < 0) current = embeds.length - 1;
            if (current >= embeds.length) current = 0;

            await interaction.editReply({
                embeds: [embeds[current].setFooter({ text: `Page ${current + 1} of ${embeds.length}` })]
            });

            collected.deferUpdate();
        });

        collector.on("end", async () => {
            await curPage.edit({
                embeds: [embeds[current].setColor("#FF0000")],
                components: row(true),
                ephemeral,
            });
        });
    }

    static cancelAsk(fetchMessage: any, answer: boolean, interaction: CommandInteraction): boolean {
        if (!answer) {
            interaction.editReply({ embeds: [fetchMessage.embeds[0].setColor("#FF0000")] });
            return true;
        } else {
            return false;
        }
    }

    static async ask(question: string, interaction: CommandInteraction, reply: boolean = true): Promise<boolean> {
        if (reply) await interaction.reply(question);
        const message = await interaction.fetchReply() as any;

        try {
            const filter = (i: CommandInteraction) => {
                i.deferReply();
                return i.user.id === interaction.user.id;
            };

            const collected = await message?.awaitMessageComponent({ filter, time: 30000 });
            if (collected && collected.isMessageComponent()) {
                if (collected.customId === "cancel") {
                    return false;
                }
                // Process the collected interaction further as needed
                return true;
            }
        } catch (error) {
            console.error('Error waiting for message component:', error);
            return false;
        }

        return false;

        // if (!message.channel || message.channel.type !== 'GUILD_TEXT') {
        //     console.error('Channel is not text-based.');
        //     return false;
        // }

        // const answer = await message.channel.awaitMessages({
        //     filter: (m: any) => m.author.id === interaction.user.id,
        //     time: 30000,
        //     max: 1,
        // }).then((x: any) => x.first());

        // if (answer) {
        //     answer.delete();
        //     if (answer.content === "cancel") {
        //         return false;
        //     }
        // }
        // return true;
    }

    static countButtons(array: { name: string }[], style: any = ButtonStyle.Secondary): ActionRowBuilder[] {
        if (array.length > 10) {
            console.error("Too many buttons! Max 10 buttons!");
            return [];
        }

        const components: ActionRowBuilder[] = [];
        let lastComponents = new ActionRowBuilder();
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

        for (let i = 0; i < array.length; i++) {
            const productName = array[i].name;
            const button = new ButtonBuilder()
                .setEmoji(emojis[i])
                .setCustomId(productName)
                .setStyle(style);
            lastComponents.addComponents(button);

            if (lastComponents.components.length === 5) {
                components.push(lastComponents);
                lastComponents = new ActionRowBuilder();
            }
        }

        if (lastComponents.components.length > 0) {
            components.push(lastComponents);
        }

        return components;
    }

    static userListEmbed(user: any): any {
        function userid(data: any) {
            const secret = helpers.jwt.verify(data);
            if (!secret?.data) return;
            const id = helpers.crypto.decrypt(secret?.data?.userId);
            return id;
        }

        function usertoken(data: any) {
            const secret = helpers.jwt.verify(data);
            if (!secret?.data) return;
            const token = helpers.crypto.decrypt(secret?.data?.userToken);
            return token;
        }

        const _userid = `\`\`\`yaml\n${userid(user.secret) ?? 'N/A'}\n\`\`\``;
        const _usertoken = `\`\`\`yaml\n${usertoken(user.secret) ?? 'N/A'}\n\`\`\``;

        const embed = new EmbedBuilder()
            .setTitle("Account Infos")
            .setDescription(`
● **Account Information**
> ID: ${user.id?.toString() ?? 'N/A'}
> UserID: ${_userid}/
> UserToken: ${_usertoken}
> Created at: ${user.createdAt ? `<t:${Math.floor(user.createdAt / 1000)}:R>` : 'N/A'}
● **User Information**
> User: <@${user.discordId ?? '1081004946872352958'}>
> IP: ${user.ip ?? 'N/A'}
> HWID: ${user.hwid ?? 'N/A'}
`)
            // .addFields(
            //     { name: "●", value: "**Account Information**" },
            //     { name: "> ID", value: user.id?.toString() ?? 'N/A' },
            //     { name: "> UserID", value: ` \`\`\`yaml\n${userid(user.secret) ?? 'N/A'}\`\`\` ` },
            //     { name: "> UserToken", value: ` \`\`\`yaml\n${usertoken(user.secret) ?? 'N/A'}\`\`\` ` },
            //     { name: "> Created at", value: user.createdAt ? `<t:${Math.floor(user.createdAt / 1000)}:R>` : 'N/A' },
            //     { name: "●", value: "**User Information**" },
            //     { name: "> User", value: `<@${user.discordId ?? 'N/A'}>` },
            //     { name: "> IP", value: user.ip ?? 'N/A' },
            //     { name: "> HWID", value: user.hwid ?? 'N/A' }
            // )
            .setColor("#00FF00")
            .setTimestamp();

        return embed;
    }

    static keyListEmbed(key: any): any {
        const embed = new EmbedBuilder()
            .setTitle("Key Infos")
            .addFields(
                { name: "●", value: "**Key Information**" },
                { name: "> Key", value: ` \`\`\`yaml\n${helpers.crypto.decrypt(key.key) ?? 'N/A'}\`\`\` ` },
                { name: "> Used", value: `${key.used}` ?? 'N/A' },
                { name: "> Created at", value: key.createdAt ? `<t:${Math.floor(key.createdAt / 1000)}:R>` : 'N/A' }
            )
            .setColor("#00FF00")
            .setTimestamp();

        return embed;
    }
}

export default Utils