import { type Client } from "discord.js";
import { BotEvent, IProducts } from "../types";
import { color } from "../functions";
import * as cron from "node-cron";
import OrderModel from "../schemas/Order";
import ProductModel from "../schemas/Products";
import Ready from "../utils/Ready.event";

const event: BotEvent = {
    name: "ready",
    once: false,
    execute: async (client: Client) => {
        console.log(
            color("text", `💪 Logged in as ${color("variable", client.user?.tag)}`)
        );

        new Ready().run(client);

        async function dataHandler() {
            const data = await ProductModel.find({});
            data.forEach(async (product: IProducts) => {
                const date = new Date();
                if (date >= new Date(product.time)) {
                    await product.deleteOne();
                }
            });
        }

        dataHandler();

        // Repeat dataHandler after 10 seconds
        setTimeout(() => {
            dataHandler();
        }, 10_000);

        // Schedule weekly cleanup of orders every Sunday at midnight
        // cron.schedule('0 0 * * 0', async () => {
        //     await OrderModel.deleteMany({});
        // }, {
        //     scheduled: true,
        //     timezone: "Europe/Moscow"
        // });
    }
};

export default event;
