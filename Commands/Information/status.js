const { Client, ChatInputCommandInteraction, ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } = require("discord.js")
const Reply = require("../../Systems/Reply")
const { connection } = require("mongoose")

module.exports = {
    name: "status",
    description: "Display the status",
    category: "Information",
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        await interaction.deferReply()

        const button = new ButtonBuilder() 
        .setLabel('status page !')
        .setURL('https://geantbot.statuspage.io/')
        .setStyle(ButtonStyle.Link)


            const embed = new EmbedBuilder()
            .setTitle("Status")
            .setDescription(`**Client**: \`🟢 ONLINE\` - \`${client.ws.ping} ms\`\n **uptime**: <t:${parseInt(client.readyTimestamp / 1000)}:R>\n\n**Database**: \`${switchTo(connection.readyState)}\``)
       

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

        return interaction.editReply({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(button)]
        });
    }
}