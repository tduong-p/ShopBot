import { ActionRowBuilder, ButtonBuilder, ButtonStyle, DMChannel, ModalSubmitInteraction, TextChannel } from "discord.js";
import UserModel from "../../schemas/User";
import * as config from "../../config";
import OrderModel from "../../schemas/Order";

export default class kazamiDEVModal {
    async run(interaction: ModalSubmitInteraction) {
        const entry = await UserModel.findOne({ ticket_id: interaction.channel!.id }).exec();

        if (!entry) {
            return await interaction.reply({ content: "An unexpected error occurred, please try again.", flags: 64 });
        }

        const name = interaction.fields.getTextInputValue("product_name");
        const priceValue = interaction.fields.getTextInputValue("product_price");
        const price = Number(priceValue);
        if (isNaN(price)) {
        return await interaction.reply({
            content: "❌ Invalid price format. Please enter a number like `100000`.",
            ephemeral: true
        });
        }

        const channel = await interaction.guild!.channels.fetch(config.ticketsLogs_channel) as TextChannel;

        const order = new OrderModel({
        seller: interaction.user.id,
        name: interaction.fields.getTextInputValue("product_name"),
        valute: "VND",         // ✅ hardcoded currency
        price: price,          // ✅ number only
        buyer: entry.id,
        });

        await order.save();

        await channel!.send({
            embeds: [{
                description: `# ${interaction.user} closed the ticket for __\`${name}\`__ at __\`${price}\`__\n<t:${Math.floor(Date.now() / 1000)}:F>\n<@${entry._id}> \`678203623708033024\``,
                color: 10535045
            }]
        });

        entry.active_ticket = false;
        await entry.save();

        const feedbackButton = new ButtonBuilder()
            .setLabel("Leave a Review")
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${interaction.guild!.id}/${config.feedback_channel}`);

        const row = [new ActionRowBuilder<ButtonBuilder>().addComponents(feedbackButton)];

        const dm = await interaction.guild?.members.cache.get(entry._id)!.createDM() as DMChannel;

        if (dm) {
            dm.send({
                content: `Don't forget to leave a review about the service you received!`,
                components: row
            });
        }

        await interaction.reply({ content: "Ticket closed." });
        return await interaction.channel!.delete();
    }
}
