const { SlashCommandBuilder, CommandInteraction, PermissionFlagsBits, ChatInputCommandInteraction, Client, EmbedBuilder } = require("discord.js") 
const { connection } = require("mongoose")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Get bot status"),
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction, client) {
        const msg = await interaction.deferReply({fetchReply: true})

        const embed = new EmbedBuilder()
        .setTitle("Here is my stats")
        .setDescription("Bots stats")
        .addFields(
            {
                name: "Discord Api latency",
                value: `${client.ws.ping} ms`,
                inline: true
            },
            {
                name: "Bot latency",
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
                case 0: status = `🔴 Disconnected`
                break;
                case 1: status = `🟢 connected`
                break;
                case 2: status = `🟠 Conneting...`
                break;
                case 3: status = `🟣 Déconnexion en cours`
                break;
            }
            return status
        }

        interaction.editReply({embeds: [embed]})
    }
}