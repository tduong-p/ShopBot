import { ActionRowBuilder, AttachmentBuilder, ButtonStyle, Client, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextChannel } from "discord.js";
import * as config from "../config"

export default class Ready {
    async run(client: Client) {
        const guild = client.guilds.cache.get(config.guild);
        const channel = guild!.channels.cache.get(config.channel) as TextChannel;
        const file = new AttachmentBuilder(`${__dirname}/../../assets/img/start_photo.png`);

        if (!channel || !guild) return;

        const select = new StringSelectMenuBuilder()
            .setCustomId("product_select")
            .setPlaceholder("Bạn cần hỗ trợ gì?")
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel("Mua hàng")
                    .setValue("order")
                    .setEmoji(config.emojis.nitro)
                    .setDescription("Mua hàng"),

                new StringSelectMenuOptionBuilder()
                    .setLabel("Hỗ trợ")
                    .setValue("help")
                    .setEmoji(config.emojis.support)
                    .setDescription("Liên hệ nhân viên hỗ trợ"),

                new StringSelectMenuOptionBuilder()
                    .setLabel("Claim Giveaway")
                    .setValue("get_prise")
                    .setEmoji(config.emojis.nitrogift)
                    .setDescription("Nhận giải giveaway")
            )

        const as = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

        return channel.send({
            content: "",
            tts: false,
            embeds: [
                {
                    color: 10535045,
                    image: {
                        url: "https://cdn.discordapp.com/attachments/1384928324664426657/1385254878342942811/image.png?ex=685566a3&is=68541523&hm=48a0bbc4bddbd2b52d4cbc391cc0134b1e646910a9439a4bacd99a9523e7c191&"
                    }
                },
            ],
            components: [as],
        });
    };
};
