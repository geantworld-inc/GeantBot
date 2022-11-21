const { Client, ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const lvlDB = require("../../Schemas/Level")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("set-xp")
    .setDescription("set xp for a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option => option.setName("member").setDescription("select a valid member").setRequired(true))
    .addIntegerOption(option => option.setName("xp").setDescription("the amount to add").setRequired(true)),
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
     async execute(interaction, client) {
        await interaction.deferReply({ephemeral: true})

        const { guild, options } = interaction

        const member = options.getMember("member")
        const xp = options.getInteger("xp")

        const Data = await lvlDB.find({Guild: guild.id, User: member.id}).catch(err => {  })

        try {
            try {member.send({content: `${interaction.user} set your xp for ${xp} in ${guild.name}`})} catch (err) {  }
            await lvlDB.updateOne({Guild: guild.id, User: member.id}, {XP: xp})
            interaction.editReply("Success")
        } catch (error) {
            console.log(error)
        }
    }
}