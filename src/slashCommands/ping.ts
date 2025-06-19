import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getThemeColor } from "../functions";
import { SlashCommand } from "../types";

const command: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Check the bot's ping"),
    
    execute: (interaction) => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`🏓 Pong!\n📡 Bot ping: ${interaction.client.ws.ping}ms`)
                    .setColor(getThemeColor("text"))
            ]
        });
    },

    cooldown: 10
};

export default command;
