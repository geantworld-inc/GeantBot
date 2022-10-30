const { Client, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const ms = require("ms")

module.exports = {
    name: "messageCreate",
    /**
     * @param {Message} message
     * @param {Client} client
     */
    async execute(message, client) {
        const { author, guild, content } = message
        const { user } = client

        if (!guild || author.bot) return
        if (content.includes("@here") || content.includes("@everyone")) return
        if (!content.includes(user.id)) return

        return message.reply({

            embeds: [
                new EmbedBuilder()
                    .setColor("Random")
                    .setAuthor({name: author.username, iconURL: user.displayAvatarURL()})
                    .setDescription(`hey, you called me ? please type /help for more information`)
                    .setThumbnail(user.displayAvatarURL())
                    .setFooter({text: "duckBot"})
                    .setTimestamp()
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://discord.com/api/oauth2/authorize?client_id=1003685828284919868&permissions=8&scope=bot%20applications.commands")
                        .setLabel("Invite Me!"),
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setURL("https://dash.duckbot.tk/")
                        .setLabel("Dashboard")
                )
            ]
        }).then(msg => {
            setTimeout(() => {
                msg.delete().catch(err => {

                    if (err.code !== 10008) return console.log(err)

                })
            }, ms("15s"));
        })
    }
}