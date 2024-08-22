import { Interaction, EmbedBuilder } from "discord.js";
import {BotEvent, SlashCommand, VerificationResult} from "../../../types";
import userModel from "../../models/user";
import keyModel from "../../models/key";
import helpers from "../../helpers";

const event: BotEvent = {
  enable: true,
  name: "interactionCreate",
  execute: async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command || !command.enable) {
        return interaction.reply(
          "This command is not available at the moment, please try again later."
        );
      }

      const userCooldownKey = `${interaction.commandName}-${interaction.user.username}`;
      const cooldown = interaction.client.cooldowns.get(userCooldownKey);
      if (command.cooldown && cooldown && Date.now() < cooldown) {
        const remainingCooldown = Math.floor((cooldown - Date.now()) / 1000);
        interaction.reply(
          `You have to wait ${remainingCooldown} second(s) to use this command again.`
        );
        setTimeout(() => interaction.deleteReply(), 5000);
        return;
      }

      if (command.cooldown) {
        interaction.client.cooldowns.set(
          userCooldownKey,
          Date.now() + command.cooldown * 1000
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
    } else if (interaction.isAutocomplete()) {
      handleAutocomplete(interaction);
    } else if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction);
    } else if (interaction.isContextMenuCommand()) {
      const context: SlashCommand | undefined = interaction.client.commands.get(interaction.commandName);
      if (!context || !context.enable) {
        return interaction.reply(
          "This feature is not available at the moment, please try again later."
        );
      }

      try {
        return context.execute(interaction);
      } catch (error: any) {
        await handleCommandError(interaction, error);
      }
    }
  },
};

async function handleCommandError(interaction: any, error: any) {
  helpers.consola.error(error);
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("#FBC630")
        .setTimestamp()
        .setDescription("Something went wrong!"),
    ],
  });
}

function handleAutocomplete(interaction: any) {
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

async function handleModalSubmit(interaction: any) {
  const customId = interaction.customId;
  switch (customId) {
    case "deletekey":
      await handleKeyDeletion(interaction);
      break;
    case "redeem":
      await handleKeyRedemption(interaction);
      break;
    case "discordupdate":
      await handleDiscordUpdate(interaction);
      break;
    default:
      break;
  }
}

async function handleKeyDeletion(interaction: any) {
  const key = interaction.fields.getTextInputValue("keyInput");

  try {
    const keys = await keyModel.find();

    for (const data of keys) {
      const decryptedKey: string = helpers.crypto.decrypt(data.key);
      if (decryptedKey !== key) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Key not found"),
          ],
          ephemeral: true,
        });
      }

      await data.deleteOne();
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Key deleted"),
        ],
        ephemeral: true,
      });
    }

    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Key not found"),
      ],
      ephemeral: true,
    });
  } catch (err) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Internal server error"),
      ],
      ephemeral: true,
    });
  }
}

async function handleKeyRedemption(interaction: any) {
  const user = interaction.user;
  const key = interaction.fields.getTextInputValue("keyInput");

  try {
    const userCheck = await userModel.findOne({ discordId: user.id });
    const keys = await keyModel.find();

    for (const data of keys) {
      const decryptedKey: string = helpers.crypto.decrypt(data.key);
      if (decryptedKey !== key) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Key not found"),
          ],
          ephemeral: true,
        });
      }
      if (userCheck) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription(`You already have a ${process.env.NAME} account`),
          ],
          ephemeral: true,
        });
      }

      if (!data || data.used) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription(
                "That key doesn't exist or has already been redeemed"
              ),
          ],
          ephemeral: true,
        });
      }

      const userInfo = helpers.crypto.genUserInfo();

      if (!userInfo) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Internal server error"),
          ],
          ephemeral: true,
        });
      }

      const userId: string = helpers.crypto.encrypt(userInfo.id);
      const userToken: string = helpers.crypto.encrypt(userInfo.token);

      if (!userId || !userToken) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Internal server error"),
          ],
          ephemeral: true,
        });
      }

      const secret: string | undefined = helpers.jwt.generate(userId, userToken);

      let nextId: number;

      try {
        const count: number = await userModel.countDocuments({});
        nextId = count + 1;
      } catch (err) {
        helpers.consola.error(err);
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Internal server error"),
          ],
          ephemeral: true,
        });
      }

      try {
        data.used = true;
        data.save();

        await new userModel({
          id: nextId,
          secret,
          discordId: user.id,
        }).save();

        await user?.send({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription(
                `Id: \`${userInfo.id}\`\nToken: \`${userInfo.token}\``
              ),
          ],
        });

        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Key redeemed, check DMs"),
          ],
          ephemeral: true,
        });
      } catch (err) {
        helpers.consola.error(err);
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Internal server error"),
          ],
          ephemeral: true,
        });
      }
    }
    return await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Key not found"),
      ],
      ephemeral: true,
    });
  } catch (err) {
    helpers.consola.error(err);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Internal server error"),
      ],
      ephemeral: true,
    });
  }
}

async function handleDiscordUpdate(interaction: any) {
  const id = interaction.fields.getTextInputValue("accountId");

  try {
    const data: VerificationResult = await helpers.verify.verifyId(id);

    if (!data?.success) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription(data.message),
        ],
        ephemeral: true,
      });
    }

    if (data.discordData.id === interaction.user.id) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription(`This discord account is already linked to your ${process.env.NAME} account`),
        ],
        ephemeral: true,
      });
    }

    const user = await userModel.findOne({
      discordId: data.discordData.id,
    });

    if (!user) {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FBC630")
            .setTimestamp()
            .setDescription("Internal server error"),
        ],
        ephemeral: true,
      });
    }

    user.discordId = interaction.user.id;
    user.save();

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Discord account updated"),
      ],
      ephemeral: true,
    });
  } catch (err) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Internal server error"),
      ],
      ephemeral: true,
    });
  }
}

export default event;