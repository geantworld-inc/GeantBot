const { Client, ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const DB = require("../../Schemas/Verification")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("verify-setup")
    .setDescription("setup the verify system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addRoleOption(option => option.setName("role").setDescription("provid a valid role").setRequired(true))
    .addChannelOption(option => option.setName("channel").setDescription("provid a valid channel").setRequired(false))
    .addStringOption(option => option.setName("description").setDescription("provid a description").setRequired(false))
    .addStringOption(option => option.setName("title").setDescription("provid a title").setRequired(false))
    .addStringOption(option => option.setName("btn-message").setDescription("provid a message").setRequired(false)),
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
     async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true })

        const { options, guild, channel } = interaction

        const role = options.getRole("role")
        const Channel = options.getChannel("channel") || channel
        let message = interaction.options.getString('description')
        let title = interaction.options.getString('title')
        let Btn = interaction.options.getString('button-message')

        let Data = await DB.findOne({ Guild: guild.id }).catch(err => { })

        if(!Data) {
            Data = new DB({
                Guild: guild.id,
                Role: role.id,
                BtnMessage: Btn,
                Description: message,
                Title: title
            })

            await Data.save()
        } else {
            Data.Role = role.id
            await Data.save()
        }

        Channel.send({
            embeds: [
                new EmbedBuilder()
                .setTitle(title || "Verification")
                .setColor("DarkGrey")
                .setDescription(message || "Click on the button to verify")
                .setTimestamp()
            ],
            components: [
                new ActionRowBuilder().addComponents(

                    new ButtonBuilder()
                    .setCustomId("verify")
                    .setLabel(Btn || "Verify")
                    .setStyle(ButtonStyle.Success)
                )
            ]
        })

        return interaction.editReply({content: "Success"})
    }
}