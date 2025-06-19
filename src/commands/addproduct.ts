import { PermissionFlagsBits } from "discord.js";
import { Command } from "../types";
import ProductModel from "../schemas/Products";
import { approved_roles, roles } from "../config";

const command: Command = {
    name: "addproduct",
    execute: async (message, args) => {
        const roles = message.member!.roles.cache;
        const hasrole = roles.filter(role => approved_roles.includes(role.id));
        
        if (hasrole.size === 0)
            return await message.reply({ content: "You are not allowed to use this command!" });

        if (args.length < 3) {
            return await message.reply({ content: "Please provide a product URL." });
        }

        const products = new ProductModel({
            name: args[1],
            url: args[2],
            time: new Date(Date.now() + 48 * 60 * 60 * 1000) // sets expiration 48h from now
        });

        await products.save();
        return await message.reply({ content: "Product has been added!" });
    },
    cooldown: 10,
    aliases: ["addnitro"],
    permissions: [PermissionFlagsBits.Administrator]
}

export default command;
