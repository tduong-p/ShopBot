import { ChannelType, Message } from "discord.js";
import { checkPermissions, sendTimedMessage } from "../functions";
import { BotEvent } from "../types";

const event: BotEvent = {
    name: "messageCreate",
    execute: async (message: Message) => {
        if (!message.member || message.member.user.bot) return;
        if (!message.guild) return;

        const prefix = "!";

        if (!message.content.startsWith(prefix)) return;
        if (message.channel.type !== ChannelType.GuildText) return;

        const args = message.content.substring(prefix.length).split(" ");
        let command = message.client.commands.get(args[0]);

        if (!command) {
            const commandFromAlias = message.client.commands.find((cmd) =>
                cmd.aliases.includes(args[0])
            );
            if (commandFromAlias) command = commandFromAlias;
            else return;
        }

        const cooldownKey = `${command.name}-${message.member.user.username}`;
        const cooldown = message.client.cooldowns.get(cooldownKey);
        const neededPermissions = checkPermissions(message.member, command.permissions);

        if (neededPermissions !== null) {
            return sendTimedMessage(
                `You do not have sufficient permissions to use this command.\nRequired permissions: ${neededPermissions.join(", ")}`,
                message.channel,
                5000
            );
        }

        if (command.cooldown && cooldown) {
            if (Date.now() < cooldown) {
                return sendTimedMessage(
                    `You need to wait ${Math.floor((cooldown - Date.now()) / 1000)} second(s) to use this command again.`,
                    message.channel,
                    5000
                );
            }

            message.client.cooldowns.set(
                cooldownKey,
                Date.now() + command.cooldown * 1000
            );

            setTimeout(() => {
                message.client.cooldowns.delete(cooldownKey);
            }, command.cooldown * 1000);
        } else if (command.cooldown && !cooldown) {
            message.client.cooldowns.set(
                cooldownKey,
                Date.now() + command.cooldown * 1000
            );
        }

        command.execute(message, args);
    }
};

export default event;
