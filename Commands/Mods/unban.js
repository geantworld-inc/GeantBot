const { Client, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const ms = require("ms")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("unban a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option => option.setName("user-id").setDescription("provid a valid user id").setRequired(true)),
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true })

        const { options, user, guild } = interaction

        const id = options.getString("user-id")
        if (isNaN(id)) return interaction.editReply({content: `❌ | Please provide a valid ID in the numbers!`})

        const bannedMembers = await guild.bans.fetch()
        if (!bannedMembers.find(x => x.user.id)) return interaction.editReply({content: `❌ | The user is not banned yet!`})

        const Embed = new EmbedBuilder()
            .setColor("Random")

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setCustomId("unban-yes")
                .setLabel("Yes"),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
                .setCustomId("unban-no")
                .setLabel("No")
        )

        const Page = await interaction.editReply({
            embeds: [
                Embed.setDescription(`**⚠️ | Do you really want to unban this member?**`)
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
                case "unban-yes":
                    guild.members.unban(id)

                    interaction.editReply({
                        embeds: [
                            Embed.setDescription(`✅ | <@${id}> has been unbanned`)
                        ],
                        components: []
                    })
                    break;
                case "unban-no":
                    interaction.editReply({
                        embeds: [
                            Embed.setDescription(`✅ | unban request cancelled`)
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