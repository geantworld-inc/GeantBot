const { Client, ChatInputCommandInteraction, AttachmentBuilder, EmbedBuilder } = require("discord.js")
const Reply = require("../../Systems/Reply")
const lvlDB = require("../../Schemas/Level")
const Canvacord = require('canvacord')

module.exports = {
    name: "level",
    description: "Display your level",
    category: "Level",
    options: [
        {
            name: "user",
            description: "view user rank",
            type: 6,
            required: false,
        }
    ],
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false })

        const { user, guild } = interaction

        const Member = interaction.options.getUser("user") || user;
        const member = guild.members.cache.get(Member.id)

        const Data = await lvlDB.findOne({Guild: guild.id, User: member.id}).catch(err => {  })
        if (!Data) return interaction.editReply({content: `${member.user.tag} has not gained any XP`})


        const required = Data.Level * Data.Level * 100 + 100

        const rank = new Canvacord.Rank()
        .setAvatar(member.displayAvatarURL({ forceStatic: true }))
        .setBackground("IMAGE", "https://media.discordapp.net/attachments/885258885131296778/1036315264838553620/unknown.png")
        .setCurrentXP(Data.XP)
        .setRequiredXP(required)
        .setRank(1, "Rank", false)
        .setStatus(member.presence.status)
        .setLevel(Data.Level, "Level")
        .setProgressBar("#FFFFFF", "COLOR")
        .setUsername(member.user.username)
        .setDiscriminator(member.user.discriminator)

        const Card = await rank.build().catch(err => console.log(err))

        const attachment = new AttachmentBuilder(Card, { name: "level.png" })

        const Embed = new EmbedBuilder()
        .setColor("Random")
        .setTitle(`${member.user.username}'s Level Card`)
        .setImage("attachment://level.png")
        .setFooter({text: `Level System | Made by GeantWorld Inc.`})

        await interaction.editReply({ embeds: [Embed], files: [attachment] })
    }
}