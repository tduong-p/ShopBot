import { ActionRowBuilder, ButtonInteraction, GuildMember, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from "discord.js";
import * as config from "../../config"

export default class TryAgain {
    async run(interaction: ButtonInteraction) {
        const roles = (await interaction.guild!.members.fetch(interaction.user.id)).roles.cache;

        const hasrole = roles.filter(role => config.approved_roles.includes(role.id));
        if (hasrole.size === 0) {
            return await interaction.reply({
                embeds: [{
                    title: "Error",
                    description: "You are not allowed to press this button.",
                    thumbnail: {
                        url: interaction.user.avatarURL({ size: 512 })!.toString()
                    },
                    color: config.errorEmbedColor
                }],
                ephemeral: true
            });
        }

        const userid = interaction.customId.split("_");
        const user = await interaction.guild!.members.fetch(userid[1]) as GuildMember;

        if (!user) {
            return await interaction.update({
                embeds: [{
                    title: "Error",
                    description: "User not found.",
                    thumbnail: {
                        url: interaction.user.avatarURL({ size: 512 })!.toString()
                    },
                    color: config.errorEmbedColor
                }]
            });
        }

        if (user.user.bot) {
            return await interaction.update({
                embeds: [{
                    title: "Error",
                    description: "User cannot be a bot.",
                    thumbnail: {
                        url: String(user.user.avatarURL({ size: 512 }))
                    },
                    color: config.errorEmbedColor
                }]
            });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId(`roles_select_${user!.id}`)
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
                    .setDescription("Assign Level 3 Buyer role"),
            );

        const as = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

        await interaction.update({
            embeds: [
                {
                    title: `Assign a role to user ${user.user.username}`,
                    description: "Which role would you like to assign?",
                    thumbnail: {
                        url: user!.user.avatarURL({ size: 512 })!.toString()
                    },
                    color: config.embedColor,
                },
            ],
            components: [as]
        });
    }
}
