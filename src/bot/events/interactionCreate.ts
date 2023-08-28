import { Interaction, EmbedBuilder } from "discord.js";
import { BotEvent } from "../../../types";
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
        handleCommandError(interaction, error);
      }
    } else if (interaction.isAutocomplete()) {
      handleAutocomplete(interaction);
    } else if (interaction.isButton()) {
      if (interaction.customId === "test") {
        // Handle button interaction if needed
      }
    } else if (interaction.isModalSubmit()) {
      handleModalSubmit(interaction);
    } else if (interaction.isContextMenuCommand()) {
      const context = interaction.client.commands.get(interaction.commandName);
      if (!context || !context.enable) {
        return interaction.reply(
          "This feature is not available at the moment, please try again later."
        );
      }

      try {
        context.execute(interaction);
      } catch (error: any) {
        handleCommandError(interaction, error);
      }
    } 
  },
};

async function handleCommandError(interaction: any, error: any) {
  console.error(error);
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
    default:
      break;
  }
}

async function handleKeyDeletion(interaction: any) {
  const key = interaction.fields.getTextInputValue("keyInput");

  try {
    const keys = await keyModel.find();

    for (const data of keys) {
      const decryptedKey = helpers.crypto.decrypt(data.key);
      if (decryptedKey !== key) {
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("That not found"),
          ],
          ephemeral: true,
        });
      }

      await data.delete();
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
      const decryptedKey = helpers.crypto.decrypt(data.key);
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
              .setDescription(`You already own a ${process.env.NAME} copy`),
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

      data.used = true;
      data.save();

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

      const userId = helpers.crypto.encrypt(userInfo.id);
      const userToken = helpers.crypto.encrypt(userInfo.token);

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

      const secret = helpers.jwt.generate(userId, userToken);

      let nextId: number;

      try {
        const count = await userModel.countDocuments({});
        nextId = count + 1;
      } catch (err) {
        console.log(err);
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
        console.log(err);
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
    console.log(err);
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