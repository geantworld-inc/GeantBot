const { Client, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js")
const ms = require("ms")
const Reply = require("../../Systems/Reply")

module.exports = {
    name: "timeout",
    description: "timeout a member",
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
        {
            name: "duration",
            description: "Enter a time (in minutes)",
            type: 10,
            required: true,
        },
        {
            name: "reason",
            description: "Provide a reason",
            type: 3,
            required: false
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
        const reason = options.getString("reason") || "No reason provided"
        const duration = options.getNumber("duration")

        if (member.id === user.id) return interaction.editReply({content: `You can't timeout yourself!`})
        if (guild.ownerId === member.id) return interaction.editReply({content: `You can't timeout the server owner!`})
        if (guild.members.me.roles.highest.position <= member.roles.highest.position) return interaction.editReply({content: `You can't timeout a member of your same level or highest!`})
        if (interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.editReply({content: `I can't timeout a member of my same level or highest!`})

        const Embed = new EmbedBuilder()
            .setColor("Random")

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setCustomId("timeout-yes")
                .setLabel("Yes"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("timeout-no")
                .setLabel("No")
        )

        const Page = await interaction.editReply({
            embeds: [
                Embed.setDescription(`**⚠️ | Do you really want to timeout this member?**`)
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
                case "timeout-yes":
                    member.timeout(duration * 60 * 1000, reason).catch((err) => {console.err})

                    interaction.editReply({
                        embeds: [
                            Embed.setDescription(`✅ | ${member} has been muted for: **${reason}**`)
                        ],
                        components: []
                    })

                    member.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Random")
                                .setDescription(`You've been muted from **${guild.name}**`)
                        ]
                    }).catch(err => {

                        if (err.code !== 50007) return console.log(err)

                    })
                    break;
                case "timeout-no":
                    interaction.editReply({
                        embeds: [
                            Embed.setDescription(`✅ | timeout request cancelled`)
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