const { Client, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js")
const Reply = require("../../Systems/Reply")
const EditReply = require("../../Systems/EditReply")
const { connection } = require("mongoose")

module.exports = {
    name: "status",
    description: "Get Bot Status",
    category: "Information",
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const msg = await interaction.deferReply({fetchReply: true})

        const embed = new EmbedBuilder()
        .setTitle("Bot stats")
        .setDescription("My stats")
        .addFields(
            {
                name: "Discord API latency",
                value: `${client.ws.ping} ms`,
                inline: true
            },
            {
                name: "BOT Latency",
                value: `${msg.createdTimestamp - interaction.createdTimestamp} ms`,
                inline: true
            },
        )
        .addFields(
            {
                name: "Database",
                value: `\`${switchTo(connection.readyState)}\``,
                inline: true,
            },
            {
                name: "uptime",
                value: `<t:${parseInt(client.readyTimestamp / 1000)}:R>`,
                inline: true
            }
        )
        .setColor("Blue")


        function switchTo(val) {
            var status = " ";
            switch(val) {
                case 0: status = `🔴 DISCONNECTED`
                break;
                case 1: status = `🟢 CONNECTED`
                break;
                case 2: status = `🟠 CONNECTING`
                break;
                case 3: status = `🟣 DISCONNECTING`
                break;
            }
            return status
        }

        interaction.editReply({embeds: [embed]})
    }
}