const { Client, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const lvlDB = require("../../Schemas/Level")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Display the leaderboard"),
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
     async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: false })

        const { guild } = interaction

        let text = ""

        const Data = await lvlDB.find({Guild: guild.id})
            .sort({
                XP: -1,
                Level: -1
            })
            .limit(10)
            .catch(err => {  })

            if(!Data) return interaction.reply({content: `No one's at the leaderboard`})


            for (let counter = 0; counter < Data.length; ++counter) {
                const { User, XP, Level } = Data[counter]

                const Member = guild.members.cache.get(User)

                let MemberTag

                if(Member) MemberTag = Member.user.tag
                else MemberTag = "Unknown"

                let shortXp = shorten(XP)

                text += `${counter + 1}. ${MemberTag} | XP: ${shortXp} | Level ${Level}\n`
            }

            await interaction.editReply({

                embeds: [
                    new EmbedBuilder()
                    .setColor('Blue')
                    .setDescription(`\`\`\`${text}\`\`\``)
                ]
            })
    }
}

function shorten(count) {
    const ABBRS = ["", "K", "M", "T"]

    const i = 0 === count ? count : Math.floor(Math.log(count) / Math.log(1000))

    let result = parseFloat((count / Math.pow(1000, i)).toFixed(2))
    result += `${ABBRS[i]}`

    return result
}