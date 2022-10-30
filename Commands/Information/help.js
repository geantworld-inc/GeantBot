const { Client, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require("discord.js")
const Reply = require("../../Systems/Reply")
const fs = require("fs")

module.exports = {
    name: "help",
    description: "Display the help embed",
    category: "Information",
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        let categories = [];

        fs.readdirSync("./Commands/").forEach((dir) => {
            const commands = fs.readdirSync(`./Commands/${dir}/`).filter((file) => file.endsWith(".js"))

            const cmds = commands.map((command) => {
                let file = require(`../../Commands/${dir}/${command}`)
                if (!file.name) return "No command name.";

                let name = file.name.replace(".js", "");

                return `\`${name}\``;
            });

            let data = new Object();
            data = {
                name: dir.toUpperCase(),
                value: cmds.lenght === 0 ? "In progress." : cmds.join(" | "),
            };
            categories.push(data);
        })

        const embed = new EmbedBuilder()
            .setTitle("Commands")
            .addFields(categories)
            .setDescription(`all commands`)

            .setColor("Blue");
        return interaction.reply({ embeds: [embed] })
    }   
}