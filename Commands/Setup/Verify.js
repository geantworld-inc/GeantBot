const { Client, ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js")
const DB = require("../../Schemas/Verification")

module.exports = {
    name: "verify",
    description: "setup the verify system",
    category: "Setup",
    options: [
        {
           name: "role",
           description: "select a role",
           type: 8,
           required: true 
        },
        {
            name: "channel",
            description: "Select a channel",
            type: 7,
            required: false
        },
        {
            name: "description",
            description: "Enter a message",
            type: 3,
            required: false,
        },
        {
            name: "title",
            description: "Enter a title",
            type: 3,
            required: false
        },
        {
            name: "button-message",
            description: "Enter a button message",
            type: 3,
            required: false
        }
    ],
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