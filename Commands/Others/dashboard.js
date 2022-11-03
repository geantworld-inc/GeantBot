const { Client, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const Reply = require("../../Systems/Reply")

module.exports = {
    name: "dashboard",
    description: "open the dashboard",
    category: "Others",
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setTitle("dashboard")
            .setDescription("click on the button for access the dashboard")
            .setTimestamp(Date.now())

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("Go to the dashboard")
                .setURL("https://dash.geantworldinc.tk/")
                .setDisabled(false)
        )

        await interaction.reply({embeds: [embed], components: [row]})
    }
}