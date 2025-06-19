import { PermissionFlagsBits } from "discord.js";
import { Command } from "../types";
import ProductModel from "../schemas/Products";
import { approved_roles, roles } from "../config";

const command: Command = {
    name: "inventory",
    execute: async (message, args) => {
        const roles = message.member!.roles.cache;
        const hasrole = roles.filter(role => approved_roles.includes(role.id));
        
        if (hasrole.size === 0)
            return await message.reply({ content: "You are not allowed to use this command!" });

        if (args.length < 2)
            return await message.reply({ content: "Please specify the product name." });

        const countProducts = await ProductModel.countDocuments({ name: args[1] });
        return await message.reply({ content: `There are currently ${countProducts} units of ${args[1]} in the inventory.` });
    },
    cooldown: 10,
    aliases: ["inv"],
    permissions: [PermissionFlagsBits.Administrator]
}

export default command;
