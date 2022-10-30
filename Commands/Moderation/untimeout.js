const { Client, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js")
const ms = require("ms")
const Reply = require("../../Systems/Reply")

module.exports = {
    name: "untimeout",
    description: "untimeout a member",
    UserPerms: ["ModerateMembers"],
    BotPerms: ["ModerateMembers"],
    category: "Moderation",
    options: [
        {
            name: "user",
            description: "Select the user",
            type: 6,
            required: true
        },
    ],
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true })

        const { options, user, guild } = interaction

        const member = options.getMember("user")

        if (member.id === user.id) return interaction.editReply({content: `You can't untimeout yourself!`})
        if (guild.ownerId === member.id) return interaction.editReply({content: `You can't untimeout the server owner!`})
        if (guild.members.me.roles.highest.position <= member.roles.highest.position) return interaction.editReply({content: `You can't untimeout a member of your same level or highest!`})
        if (interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.editReply({content: `I can't untimeout a member of my same level or highest!`})

        const Embed = new EmbedBuilder()
            .setColor("Random")

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setCustomId("untimeout-yes")
                .setLabel("Yes"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("untimeout-no")
                .setLabel("No")
        )

        const Page = await interaction.editReply({
            embeds: [
                Embed.setDescription(`**⚠️ | Do you really want to untimeout this member?**`)
            ],
            components: [row]
        })

        const col = await Page.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: ms("15s")
        })

        col.on("collect", i => {
            if (i.user.id !== user.id) return

            switch (i.customId) {
                case "untimeout-yes":
                    member.timeout(null).catch((err) => {console.err})

                    interaction.editReply({
                        embeds: [
                            Embed.setDescription(`✅ | ${member} has been unmuted`)
                        ],
                        components: []
                    })

                    member.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Random")
                                .setDescription(`You've been unmuted from **${guild.name}**`)
                        ]
                    }).catch(err => {

                        if (err.code !== 50007) return console.log(err)

                    })
                    break;
                case "untimeout-no":
                    interaction.editReply({
                        embeds: [
                            Embed.setDescription(`✅ | untimeout request cancelled`)
                        ],
                        components: []
                    })
                    break;
            }
        })

        col.on("end", (collected) => {
            if (collected.size > 0) return

            interaction.editReply({
                embeds: [
                    Embed.setDescription(`❌ | You didn't provide a valid response in time!`)
                ],
                components: []
            })
        })
    }
}