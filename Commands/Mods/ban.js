const { Client, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const ms = require("ms")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option => option.setName("user").setDescription("user to ban").setRequired(true))
    .addStringOption(option => option.setName("reason").setDescription("provid a reason").setRequired(false)),
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true })

        const { options, user, guild } = interaction

        const member = options.getMember("user")
        const reason = options.getString("reason") || "No reason provided"

        if (member.id === user.id) return interaction.editReply({content: `You can't ban yourself!`})
        if (guild.ownerId === member.id) return interaction.editReply({content: `You can't ban the server owner!`})
        if (guild.members.me.roles.highest.position <= member.roles.highest.position) return interaction.editReply({content: `You can't ban a member of your same level or highest!`})
        if (interaction.member.roles.highest.position <= member.roles.highest.position) return interaction.editReply({content: `I can't ban a member of my same level or highest!`})

        const Embed = new EmbedBuilder()
            .setColor("Random")

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setCustomId("ban-yes")
                .setLabel("Yes"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("ban-no")
                .setLabel("No")
        )

        const Page = await interaction.editReply({
            embeds: [
                Embed.setDescription(`**⚠️ | Do you really want to ban this member?**`)
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
                case "ban-yes":
                    member.ban({ reason })

                    interaction.editReply({
                        embeds: [
                            Embed.setDescription(`✅ | ${member} has been banned for: **${reason}**`)
                        ],
                        components: []
                    })

                    member.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor("Random")
                                .setDescription(`You've been banned from **${guild.name}**`)
                        ]
                    }).catch(err => {

                        if (err.code !== 50007) return console.log(err)

                    })
                    break;
                case "ban-no":
                    interaction.editReply({
                        embeds: [
                            Embed.setDescription(`✅ | ban request cancelled`)
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