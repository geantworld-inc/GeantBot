const { Client, ChatInputCommandInteraction, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const lvlDB = require("../../Schemas/LevelUp")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("level-channel")
    .setDescription("setup the channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(option => option.setName("channel").setDescription("provid a valid channel").setRequired(true)),
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
     async execute(interaction, client) {
        await interaction.deferReply({ephemeral: true})

        const { guild, options } = interaction

        const channel = options.getChannel("channel")

        lvlDB.findOne({
            Guild: interaction.guild.id
        }, async (err, data) => {
            if (data) data.delete()
            new lvlDB({
                Guild: interaction.guild.id,
                Channel: channel.id
            }).save()
            interaction.reply({content: `I have set the channel to ${channel} for level`, ephemeral: true})
        })


    }
}