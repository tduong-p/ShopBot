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
                        url: "https://media.discordapp.net/attachments/1384928324664426657/1385555340199854171/1.png?ex=68567e77&is=68552cf7&hm=2c52c371d8a59d64ae37e909324b2854ac9ad330b9fac8244c16c91aef0acc33&=&format=webp&quality=lossless&width=2784&height=1152"
                    }
                },
            ],
            components: [as],
        });
    };
};
