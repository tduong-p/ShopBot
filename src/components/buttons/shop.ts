import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
  TextChannel,
  DMChannel,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  type StringSelectMenuInteraction,
  ModalBuilder,
    type ButtonInteraction, 
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';

import * as config from '../../config';
import { createButtons } from '../../functions';
import UserModel from '../../schemas/User';

export default class Shop {
    async buy(interaction: StringSelectMenuInteraction, type: string) {

        let entry = await UserModel.findOne({ _id: String(interaction.user.id!) }).exec();

        if (!entry) {
            const db = new UserModel({ _id: interaction.user.id });
            await db.save();
        }

        entry = await UserModel.findOne({ _id: String(interaction.user.id) }).exec();

        if (!entry) {
            return await interaction.reply({ content: "An unexpected error occurred, please try again.", flags: 64 });
        }

        if (entry.active_ticket === true) {
            return await interaction.reply({ content: "You can't create multiple tickets at the same time!", flags: 64 });
        }

        //@ts-ignore
        const role = await interaction.guild!.roles.fetch(config.roles[type]);
        if (!role) return;

        const buttons = {
            "buy_close": ["Close Ticket", ButtonStyle.Danger, 1],
        };

        const row = createButtons(Object.keys(buttons), buttons);

        const channel = interaction.guild!.channels.cache.get(String(interaction.channel!.id)) as TextChannel;

        const ticket = await interaction.guild!.channels.create({
            name: `Buyer ${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: channel.parent!.id,
            permissionOverwrites: [
                {
                    id: role.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles
                    ]
                },
                {
                    id: String(interaction.guild!.id),
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id!,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
            ]
        });

        entry.active_ticket = true;
        entry.ticket_id = ticket.id;
        await entry.save();

        const message = await ticket.send({
            content: `<@&${role.id}>, ${interaction.user}`,
            embeds: [
                {
                    title: "Thân gửi quý khách hàng!",
                    description: "Chúng tôi đã được thông báo và sẽ tiếp nhận đơn trong thời gian sớm nhất. \n Vui lòng không tag Staff/Mod/Admin.",
                    color: 10535045,
                    image: {
                        url: "https://cdn.discordapp.com/attachments/847745581329940481/1094248142741979186/image.png"
                    },
                    fields: []
                },
                {
                    description: `### Vui lòng mô tả chi tiết sản phẩm hoặc dịch vụ. Đội ngũ của chúng tôi sẽ phản hồi sớm nhất.    \n
<#1385514987216310272> - <:001_angle:1385562886323310643> \`nitro\` and subscriptions
Cập nhập thêm sau Soft Opening...`,
                    color: 10535045,
                    image: {
                        url: "https://cdn.discordapp.com/attachments/847745581329940481/1094248142741979186/image.png"
                    },
                    fields: []
                }
            ],
            components: row
        });

        await ticket.messages.pin(message);
        const resetMenu = new StringSelectMenuBuilder()
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
                .setLabel("Giveaway")
                .setValue("get_prise")
                .setEmoji(config.emojis.nitrogift)
                .setDescription("Nhận giải giveaway") // hoặc thay = "🎁" nếu không có emoji
            );

            const resetRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(resetMenu);

            // Cập nhật lại message ban đầu chứa menu để reset lựa chọn
            await interaction.update({
            content: "",
            components: [resetRow]
            });

            // Gửi tin nhắn riêng cho user
            await interaction.followUp({
            ephemeral: true,
            content: `Đơn hàng đã được tạo! Bạn có thể đặt câu hỏi ở ${ticket}`
            });

    }

    async buy_close(interaction: ButtonInteraction) {
        const entry = await UserModel.findOne({ ticket_id: interaction.channel!.id }).exec();

        if (!entry) {
            return await interaction.reply({ content: "Đã có lỗi xảy ra, vui lòng thử lại hoặc liên hệ nhân viên tư vấn.", flags: 64 });
        }

        const roles = (await interaction.guild!.members.fetch(interaction.user.id)).roles.cache;
        const hasrole = roles.filter(role => config.approved_roles.includes(role.id));

        if (hasrole.size > 0) {
            const modal = new ModalBuilder()
                .setTitle('Dawn Store')
                .setCustomId("kazamiDEVModal")
                .addComponents([
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('product_name')
                            .setStyle(TextInputStyle.Short)
                            .setLabel("Product/Service Name")
                            .setPlaceholder('e.g., Nitro')
                            .setRequired(true),
                    ),
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('product_price')
                            .setStyle(TextInputStyle.Short)
                            .setLabel("Final Price")
                            .setPlaceholder('e.g., 1000 (1k vnd)')
                            .setRequired(true),
                    ),
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('product_cost')
                            .setStyle(TextInputStyle.Short)
                            .setLabel("Cost")
                            .setPlaceholder('e.g., 1000 (1k vnd)')
                            .setRequired(true),
                    )
                ]);

            await interaction.showModal(modal);
        } else {
            const feedbackButton = new ButtonBuilder()
                .setLabel("Leave Feedback")
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/channels/${interaction.guild!.id}/${config.feedback_channel}`);

            const row = [new ActionRowBuilder<ButtonBuilder>().addComponents(feedbackButton)];

            entry.active_ticket = false;
            await entry.save();

            const dm = await interaction.guild?.members.cache.get(entry._id)!.createDM() as DMChannel;
            dm.send({ content: `Don't forget to leave feedback about our service!`, components: row });

            return await interaction.channel?.delete();
        }
    }

    async close(interaction: ButtonInteraction) {
        const entry = await UserModel.findOne({ ticket_id: interaction.channel!.id }).exec();

        if (!entry) {
            return await interaction.reply({ content: "An unexpected error occurred, please try again.", flags: 64 });
        }

        entry.active_ticket = false;
        await entry.save();
        return await interaction.channel?.delete();
    }

    async teh(interaction: StringSelectMenuInteraction) {
        let entry = await UserModel.findOne({ _id: String(interaction.user.id!) }).exec();

        if (!interaction.guild) return;

        if (!entry) {
            const db = new UserModel({ _id: interaction.user.id });
            await db.save();
        }

        entry = await UserModel.findOne({ _id: String(interaction.user.id) }).exec();

        if (!entry) {
            return await interaction.reply({ content: "An unexpected error occurred, please try again.", flags: 64 });
        }

        if (entry.active_ticket === true) {
            return await interaction.reply({ content: "You can't create multiple tickets at the same time!", flags: 64 });
        }

        const buttons = {
            "close": ["Close Ticket", ButtonStyle.Danger, 1],
        };

        const row = createButtons(Object.keys(buttons), buttons);

        const channel = await interaction.guild!.channels.fetch(String(interaction.channel!.id)) as unknown as TextChannel;

        const ticket = await interaction.guild!.channels.create({
            name: `Support ${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: channel.parent!.id,
            permissionOverwrites: [
                {
                    id: config.manager_role,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles
                    ]
                },
                {
                    id: String(interaction.guild!.id),
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id!,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
            ]
        });

        entry.active_ticket = true;
        entry.ticket_id = ticket.id;
        await entry.save();

        const message = await ticket.send({ content: `<@&${config.manager_role}>`, components: row });
        await ticket.messages.pin(message);

        return await interaction.reply({ content: `Ticket created! You can ask your questions in ${ticket}`, flags: 64 });
    }

    async giveaway(interaction: StringSelectMenuInteraction) {
        let entry = await UserModel.findOne({ _id: String(interaction.user.id!) }).exec();

        if (!entry) {
            const db = new UserModel({ _id: interaction.user.id });
            await db.save();
        }

        entry = await UserModel.findOne({ _id: String(interaction.user.id) }).exec();

        if (!entry) {
            return await interaction.reply({ content: "An unexpected error occurred, please try again.", flags: 64 });
        }

        if (entry.active_ticket === true) {
            return await interaction.reply({ content: "You can't create multiple tickets at the same time!", flags: 64 });
        }

        const buttons = {
            "close": ["Close Ticket", ButtonStyle.Danger, 1],
        };

        const row = createButtons(Object.keys(buttons), buttons);

        const channel = interaction.guild!.channels.cache.get(String(interaction.channel!.id)) as TextChannel;

        const ticket = await interaction.guild!.channels.create({
            name: `Winner ${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: channel.parent!.id,
            permissionOverwrites: [
                {
                    id: config.manager_role,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory,
                        PermissionFlagsBits.AttachFiles
                    ]
                },
                {
                    id: String(interaction.guild!.id),
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id!,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
            ]
        });

        entry.active_ticket = true;
        entry.ticket_id = ticket.id;
        await entry.save();

        const message = await ticket.send({ content: `<@&${config.manager_role}>`, components: row });
        await ticket.messages.pin(message);

        return await interaction.reply({ content: `Ticket created! You can ask your questions in ${ticket}`, flags: 64 });
    }
}
