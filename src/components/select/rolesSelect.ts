import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuInteraction } from "discord.js";
import * as config from "../../config";

export default class rolesSelect {
    async run(interaction: StringSelectMenuInteraction) {
        //@ts-ignore
        const role = await interaction.guild!.roles.fetch(config.roles[interaction.values[0]]);
        const user = await interaction.guild!.members.fetch(interaction.customId.split("_")[2]);

        if (!role) {
            return await interaction.update({
                embeds: [{
                    title: "Error",
                    description: "Failed to find the role. Please try again or contact the developer.",
                    thumbnail: {
                        url: user!.user.avatarURL({ size: 512 })!.toString()
                    },
                    color: config.errorEmbedColor
                }]
            });
        }

        const button = new ButtonBuilder()
            .setLabel("Try Again")
            .setCustomId(`tryagain_${user.id}`)
            .setStyle(ButtonStyle.Primary);

        const ab = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        const hasRole = user.roles.cache.filter(userRole => role === userRole);

        if (hasRole.size > 0) {
            return await interaction.update({
                embeds: [{
                    title: "Error",
                    description: "This user already has the selected role.",
                    thumbnail: {
                        url: String(user.user.avatarURL({ size: 512 }))
                    },
                    color: config.errorEmbedColor
                }],
                components: [ab]
            });
        }

        await user.roles.add(role);
        await interaction.update({
            embeds: [{
                title: "Role Successfully Assigned",
                description: `Assigned role ${role} to user ${user}`,
                thumbnail: {
                    url: String(user.user.avatarURL({ size: 512 }))
                },
                color: config.embedColor
            }],
            components: []
        });
    }
}
