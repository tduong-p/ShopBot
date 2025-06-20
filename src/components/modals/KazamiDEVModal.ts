import { ActionRowBuilder, ButtonBuilder, ButtonStyle, DMChannel, ModalSubmitInteraction, TextChannel } from "discord.js";
import UserModel from "../../schemas/User";
import { ChannelType } from "discord.js";
import * as config from "../../config";
import OrderModel from "../../schemas/Order";

export default class kazamiDEVModal {
    async run(interaction: ModalSubmitInteraction) {
        const entry = await UserModel.findOne({ ticket_id: interaction.channel!.id }).exec();
        const ticket_id = interaction.channel!.id;
        const fetchedChannel = await interaction.guild!.channels.fetch(ticket_id);

        if (!fetchedChannel) {
            return await interaction.reply({
                content: "❌ Could not find the ticket channel.",
                ephemeral: true
            });
        }

        console.log("Fetched channel type:", fetchedChannel.type); // 🐛 debug log

        if (fetchedChannel.type !== ChannelType.GuildText) {
            return await interaction.reply({
                content: `❌ Invalid channel type: ${fetchedChannel.type}. Must be a TextChannel.`,
                ephemeral: true
            });
        }

        const ticketChannel = fetchedChannel as TextChannel;

        if (!entry) {
            return await interaction.reply({ content: "An unexpected error occurred, please try again.", flags: 64 });
        }

        const name = interaction.fields.getTextInputValue("product_name");
        const priceValue = interaction.fields.getTextInputValue("product_price");
        const costValue = interaction.fields.getTextInputValue("product_cost");
        const price = Number(priceValue);
        const cost = Number(costValue);

        console.log("Channel ID:", ticketChannel.id);
        console.log(require('discord.js').version)
        console.log("Channel type:", ticketChannel.type);
        console.log("Messages cache size:", ticketChannel.messages.cache.size);
        console.log("Can ViewChannel:", ticketChannel.permissionsFor(interaction.client.user!)?.has("ViewChannel"));
        console.log("Can ReadMessageHistory:", ticketChannel.permissionsFor(interaction.client.user!)?.has("ReadMessageHistory"));

        if (isNaN(price)) {
        return await interaction.reply({
            content: "❌ Invalid price format. Please enter a number like `100000`.",
            ephemeral: true
        });

        }
        if (isNaN(cost)) {
        return await interaction.reply({
            content: "❌ Invalid price format. Please enter a number like `100000`.",
            ephemeral: true
        });
        }

        const discordTranscripts = require('discord-html-transcripts');



        const attachment = await discordTranscripts.createTranscript(ticketChannel);

        const channel = await interaction.guild!.channels.fetch(config.ticketsLogs_channel) as TextChannel;

        const order = new OrderModel({
        seller: interaction.user.id,
        name: interaction.fields.getTextInputValue("product_name"),
        valute: "VND",         // ✅ hardcoded currency
        price: price,          // ✅ number only
        cost: cost,
        buyer: entry.id,
        });

        await order.save();

        await channel!.send({
            embeds: [{
                description: `# ${interaction.user} closed the ticket for __\`${name}\`__ at __\`${price}\`__with cost:__\`${cost}\`<t:${Math.floor(Date.now() / 1000)}:F>\n<@${entry._id}> \`678203623708033024\``,
                color: 10535045
            }]
        });

        await channel!.send({
            files: [attachment]
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
