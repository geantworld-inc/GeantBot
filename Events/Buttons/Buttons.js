const { Client, MessageContextMenuCommandInteraction, EmbedBuilder, InteractionType } = require("discord.js")
const DB = require("../../Schemas/Verification")

module.exports = {
    name: "interactionCreate",

    /**
     * @param {MessageContextMenuCommandInteraction} interaction
     * @param {Client} client
     */
    async execute(interaction, client) {
        const { guild, customId, member, type } = interaction

        if (!["close", "lock", "unlock"].includes(customId)) return
    }
}