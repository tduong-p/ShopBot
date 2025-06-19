import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} from "discord.js";
import { SlashCommand } from "../types";
import * as config from "../config";

const manage: SlashCommand = {
  //@ts-ignore
  command: new SlashCommandBuilder()
    .setName("manage")
    .setDescription("Assign a role to a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to assign a role to.")
        .setRequired(true)
    ),

  execute: async (interaction) => {
    const roles = (await interaction.guild!.members.fetch(interaction.user.id)).roles.cache;
    const hasrole = roles.filter((role) => config.approved_roles.includes(role.id));

    if (hasrole.size === 0) {
      return await interaction.reply({
        embeds: [
          {
            title: "Error",
            description: "You are not allowed to use this command.",
            thumbnail: {
              url: interaction.user.avatarURL({ size: 512 })!.toString(),
            },
            color: config.errorEmbedColor,
          },
        ],
        ephemeral: true,
      });
    }

    const user = interaction.options.getUser("user");

    if (!user) {
      return await interaction.reply({
        embeds: [
          {
            title: "Error",
            description: "User not found.",
            thumbnail: {
              url: interaction.user.avatarURL({ size: 512 })!.toString(),
            },
            color: config.errorEmbedColor,
          },
        ],
        ephemeral: true,
      });
    }

    if (user.bot) {
      return await interaction.reply({
        embeds: [
          {
            title: "Error",
            description: "The user cannot be a bot.",
            thumbnail: {
              url: user.avatarURL({ size: 512 })!.toString(),
            },
            color: config.errorEmbedColor,
          },
        ],
        ephemeral: true,
      });
    }

    const select = new StringSelectMenuBuilder()
      .setCustomId(`roles_select_${user.id}`)
      .setPlaceholder("Select a role...")
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel("Level 1 Buyer")
          .setValue("buyer1")
          .setEmoji(config.emojis.buyer1)
          .setDescription("Assign Level 1 Buyer role"),

        new StringSelectMenuOptionBuilder()
          .setLabel("Level 2 Buyer")
          .setValue("buyer2")
          .setEmoji(config.emojis.buyer2)
          .setDescription("Assign Level 2 Buyer role"),

        new StringSelectMenuOptionBuilder()
          .setLabel("Level 3 Buyer")
          .setValue("buyer3")
          .setEmoji(config.emojis.buyer3)
          .setDescription("Assign Level 3 Buyer role")
      );

    const as = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

    await interaction.reply({
      embeds: [
        {
          title: `Assign a role to user ${user.username}`,
          description: "Which role would you like to assign?",
          thumbnail: {
            url: user.avatarURL({ size: 512 })!.toString(),
          },
          color: config.embedColor,
        },
      ],
      components: [as],
    });
  },

  cooldown: 10,
};

export default manage;
