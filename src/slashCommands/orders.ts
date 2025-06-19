import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { SlashCommand } from "../types";
import { type IOrder } from "../types";
import * as config from "../config";
import OrderModel from "../schemas/Order";

const manage: SlashCommand = {
    //@ts-ignore
    command: new SlashCommandBuilder()
        .setName("orders")
        .setDescription("Check a user's weekly revenue.")
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("The user whose revenue you want to view.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    execute: async (interaction) => {
        const user = interaction.options.getUser("user");

        const data = await OrderModel.find({ seller: user?.id });

        if (data.length === 0) {
            return await interaction.reply({
                embeds: [{
                    title: "Error",
                    description: "This user hasn't made any sales.",
                    thumbnail: {
                        url: user!.avatarURL({ size: 512 })!.toString()
                    },
                    color: config.errorEmbedColor
                }],
                ephemeral: true
            });
        }

        const orders: { [currency: string]: number } = {};
        data.forEach((order: IOrder) => {
            if (!orders[order.valute]) orders[order.valute] = 0;
            orders[order.valute] += order.price;
        });

        await interaction.reply({
            embeds: [{
                title: `Weekly revenue for ${user?.username}`,
                description: Object.keys(orders)
                    .map((key) => `\`${key}: ${orders[key]}\``)
                    .join("\n"),
                color: config.embedColor
            }]
        });
    },

    cooldown: 10,
};

export default manage;
