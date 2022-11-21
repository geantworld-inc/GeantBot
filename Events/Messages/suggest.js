const { Client, Message, EmbedBuilder } = require("discord.js")
const ms = require("ms")
const dChannel = require("../../Schemas/channelSuggest")
const DB = require("../../Schemas/suggestDB")

module.exports = {
    name: "messageCreate",
    /**
     * @param {Message} message
     * @param {Client} client
     */
    async execute(message, client) {
        if (message.author.bot) return

        dChannel.findOne({Guild: message.guild.id}, async (err, data) => {

            const channel = message.guild.channels.cache.get(data.Channel)
    
            if (!channel) return
    
    
    
            if (message.channel.id === channel.id) {
                const embed = new EmbedBuilder()
                .setTitle("Suggestion !")
                .setAuthor({name: message.author.tag + " sent a suggestion", iconURL: message.author.displayAvatarURL()})
                .setDescription(`Suggestion : 
                ${message.content}`)
                .setColor("Blue")
                .addFields({name: "Status : Waiting", value: "⏳"})
    
                channel.send({embeds: [embed]}).then(m => {
                    m.react("✅")
                    m.react("❌")
                    new DB({
                        message: m.id,
                        token: m.id,
                        suggestion: message.content,
                        user: message.author.username,
                        guild: message.guild.id,
                    }).save()
                    ms("2s")
                    message.delete()
                })
            }
        })

        
        
        
    }
}