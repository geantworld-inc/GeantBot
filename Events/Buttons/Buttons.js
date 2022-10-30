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

        if(type !== InteractionType.MessageComponent) return
        
        const customID = ["verify"]
        if (!customID.includes(customId)) return

        await interaction.deferReply({ephemeral: true})

        const Data = await DB.findOne({ Guild: guild.id }).catch(err => {  })
        if(!Data) return interaction.editReply({content: "Couldn't find any data"})

        const Role = guild.roles.cache.get(Data.Role)

        if(member.roles.cache.has(Role.id)) return interaction.editReply({content: "You're already verified"})

        await member.roles.add(Role)

        interaction.editReply({content: "You are now verified"}) 
    }
}