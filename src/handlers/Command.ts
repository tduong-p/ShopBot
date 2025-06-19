import { Client, Routes, SlashCommandBuilder } from "discord.js";
import { REST } from "@discordjs/rest";
import { readdirSync } from "fs";
import { join } from "path";
import { color } from "../functions";
import { Command, SlashCommand } from "../types";
import * as config from "../config";

module.exports = async (client: Client) => {
    const slashCommands: SlashCommandBuilder[] = [];
    const commands: Command[] = [];

    const slashCommandsDir = join(__dirname, "../slashCommands");
    const commandsDir = join(__dirname, "../commands");

    // Load all slash commands
    readdirSync(slashCommandsDir).forEach(file => {
        if (!file.endsWith(".js")) return;
        const command: SlashCommand = require(`${slashCommandsDir}/${file}`).default;
        slashCommands.push(command.command);
        client.slashCommands.set(command.command.name, command);
    });

    // Load all traditional prefix commands
    readdirSync(commandsDir).forEach(file => {
        if (!file.endsWith(".js")) return;
        const command: Command = require(`${commandsDir}/${file}`).default;
        commands.push(command);
        client.commands.set(command.name, command);
    });

    const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);

    rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: slashCommands.map(command => command.toJSON())
    })
    .then((data: any) => {
        console.log(color("text", `🔥 Successfully registered ${color("variable", data.length)} slash command(s)`));
        console.log(color("text", `🔥 Successfully loaded ${color("variable", commands.length)} prefix command(s)`));
    })
    .catch(e => {
        console.error(e);
    });
};
