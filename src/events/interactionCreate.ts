import { Interaction } from "discord.js";
import { BotEvent } from "../types";
import Shop from "../components/buttons/shop";
import kazamiDEVModal from "../components/modals/KazamiDEVModal";
import rolesSelect from "../components/select/rolesSelect";
import TryAgain from "../components/buttons/tryagain";

const event: BotEvent = {
    name: "interactionCreate",
    execute: async (interaction: Interaction) => {
        try {
            // Handle select menus
            if (interaction.isStringSelectMenu()) {
                if (interaction.customId === "product_select") {
                    switch (interaction.values[0]) {
                        case "help":
                            new Shop().teh(interaction);
                            break;

                        case "get_prise":
                            new Shop().giveaway(interaction);
                            break;

                        case "order":
                            new Shop().buy(interaction, "manager");
                            break;
                    }
                }

                if (interaction.customId.startsWith("roles_select")) {
                    await new rolesSelect().run(interaction);
                }
            }

            // Handle buttons
            if (interaction.isButton()) {
                if (interaction.customId === "close") {
                    await new Shop().close(interaction);
                }

                if (interaction.customId.startsWith("tryagain")) {
                    await new TryAgain().run(interaction);
                }

                if (interaction.customId === "buy_close") {
                    await new Shop().buy_close(interaction);
                }
            }

            // Handle modal submissions
            if (interaction.isModalSubmit()) {
                if (interaction.customId === "kazamiDEVModal") {
                    await new kazamiDEVModal().run(interaction);
                }
            }

        } catch (e) {
            console.log(e);
        }

        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.slashCommands.get(interaction.commandName);
            const cooldownKey = `${interaction.commandName}-${interaction.user.username}`;
            const cooldown = interaction.client.cooldowns.get(cooldownKey);

            if (!command) return;

            if (command.cooldown && cooldown) {
                if (Date.now() < cooldown) {
                    const secondsLeft = Math.floor((cooldown - Date.now()) / 1000);
                    await interaction.reply(`You need to wait ${secondsLeft} more second(s) to use this command again.`);
                    setTimeout(() => interaction.deleteReply(), 5000);
                    return;
                }

                interaction.client.cooldowns.set(cooldownKey, Date.now() + command.cooldown * 1000);
                setTimeout(() => {
                    interaction.client.cooldowns.delete(cooldownKey);
                }, command.cooldown * 1000);

            } else if (command.cooldown && !cooldown) {
                interaction.client.cooldowns.set(cooldownKey, Date.now() + command.cooldown * 1000);
            }

            command.execute(interaction);
        }

        // Handle autocomplete interactions
        else if (interaction.isAutocomplete()) {
            const command = interaction.client.slashCommands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                if (!command.autocomplete) return;
                command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        }
    }
};

export default event;
