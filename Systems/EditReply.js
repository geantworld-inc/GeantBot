const { EmbedBuilder } = require("discord.js")

function EditReply(interaction, emoji, description, type) {
    interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor("Green")
                .setDescription(`${emoji} | ${description}`)
        ],
    })
}

module.exports = EditReply