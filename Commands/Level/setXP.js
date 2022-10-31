const { Client, ChatInputCommandInteraction } = require("discord.js")
const Reply = require("../../Systems/Reply")
const EditReply = require("../../Systems/EditReply")
const lvlDB = require("../../Schemas/Level")

module.exports = {
    name: "set-xp",
    description: "set XP for a member",
    UserPerms: ["Administrator"],
    BotPerms: ["Administrator"],
    category: "Level",
    options: [
        {
            name: "member",
            description: "Select a valid member",
            type: 6,
            required: true
        },
        {
            name: "xp",
            description: "the amount to add",
            type: 4,
            required: true
        }
    ],
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
            EditReply(interaction, "✅", "Success")
        } catch (error) {
            console.log(error)
        }
    }
}