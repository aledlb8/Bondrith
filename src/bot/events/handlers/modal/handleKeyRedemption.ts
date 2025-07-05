import { EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import userModel from "../../../../models/user";
import keyModel from "../../../../models/key";
import helpers from "../../../../helpers";

export default async function handleKeyRedemption(
  interaction: ModalSubmitInteraction
) {
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
              .setDescription("Internal server error while generating user info"),
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
              .setDescription("Internal server error while encrypting user info"),
          ],
          ephemeral: true,
        });
      }

      const secret: string | undefined = helpers.jwt.generate(userId, userToken);

      let nextId: number;

      try {
        userModel
          .countDocuments({})
          .then(async (count: number) => {
            nextId = count + 1;

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
                    .setDescription(`Id: \`${userInfo.id}\`\nToken: \`${userInfo.token}\``),
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
                    .setDescription("Internal server error while creating user"),
                ],
                ephemeral: true,
              });
            }
          })
          .catch(async (err: Error) => {
            helpers.consola.error(err);
            return await interaction.reply({
              embeds: [
                new EmbedBuilder()
                  .setColor("#FBC630")
                  .setTimestamp()
                  .setDescription("Internal server error while counting documents"),
              ],
              ephemeral: true,
            });
          });
      } catch (err) {
        helpers.consola.error(err);
        return await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor("#FBC630")
              .setTimestamp()
              .setDescription("Internal server error while counting documents"),
          ],
          ephemeral: true,
        });
      }
    }
  } catch (err) {
    helpers.consola.error(err);
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("#FBC630")
          .setTimestamp()
          .setDescription("Internal server error while redeeming key"),
      ],
      ephemeral: true,
    });
  }
}
