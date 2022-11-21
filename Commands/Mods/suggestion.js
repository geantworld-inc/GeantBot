const { Client, ChatInputCommandInteraction, EmbedBuilder, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder, SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle } = require("discord.js")
const Channel = require("../../Schemas/channelSuggest")
const suggests = require("../../Schemas/suggestDB")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("suggestion-mod")
    .setDescription("suggestions systems")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand => 
        subcommand.setName("panel")
        .setDescription("accès to the pannel")
        .addStringOption(option => option.setName("msg-id").setDescription("provid the message id for access the panel").setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand.setName("setup")
        .setDescription("setup the system")
        .addChannelOption(option => option.setName("channel").setDescription("provid a channel").setRequired(true))
    ),
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const sub = interaction.options.getSubcommand(["panel", "setup"])
        const id = interaction.options.getString("msg-id")
        const channel = interaction.options.getChannel("channel")

        switch(sub) {
            case "panel":
                suggests.findOne({
                    token: id
                }, async (err, data) => {
                    if (!data) return interaction.reply({content: `${id} : data no found ! please try again`, ephemeral: true})
                    const guild = data.guild
                    const message = data.message
                    const suggestion = data.suggestion
                    const user = data.user
                    if (data) {
                        
                            const embed = new EmbedBuilder()
                            .setTitle(`${id} Panel`)
                            .setDescription("Accept or deny the suggestion or delete this suggestion !")
                            .setColor("Random")

                            if(interaction.guild.id !== guild) return interaction.reply({content: "invalid token"})


                            const c = await Channel.findOne({
                                Guild: interaction.guild.id
                            })
                            const channel = c.Channel;
                            const gchannel = interaction.guild.channels.cache.get(channel)
                            if(!gchannel) return interaction.reply({content: "Couldn't find suggestion channel please make a new one"})

                            if(channel) {
                            const row = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                .setCustomId("accept")
                                .setEmoji("✅")
                                .setLabel("Accept This suggest")
                                .setStyle(ButtonStyle.Success),

                                new ButtonBuilder()
                                .setCustomId("deny")
                                .setEmoji("❌")
                                .setLabel("Deny This suggest")
                                .setStyle(ButtonStyle.Danger),

                                new ButtonBuilder()
                                .setCustomId("delete")
                                .setEmoji("🚫")
                                .setLabel("Delete This suggest")
                                .setStyle(ButtonStyle.Secondary)
                            )

                            interaction.reply({content: `panel of ${id}`, embeds: [embed], components: [row], ephemeral: true})

                            client.on('interactionCreate', async (interaction) => {
                                if (interaction.isButton()) {
                                    if (interaction.customId === "accept") {
                                        const modal = new ModalBuilder()
                                        .setTitle("Accept Suggestion")
                                        .setCustomId("accepted-modal")
                                        .setComponents(
                                            new ActionRowBuilder().setComponents(
                                                new TextInputBuilder()
                                                .setLabel("reason for accepting the suggestion")
                                                .setCustomId("reason-accept")
                                                .setStyle(TextInputStyle.Paragraph)
                                                .setRequired(true)
                                            )
                                        )

                                        await interaction.showModal(modal)
                                    } else if (interaction.customId === "deny") {
                                        const modal = new ModalBuilder()
                                        .setTitle("Accept Suggestion")
                                        .setCustomId("deny-modal")
                                        .setComponents(
                                            new ActionRowBuilder().setComponents(
                                                new TextInputBuilder()
                                                .setLabel("reason for deny the suggestion")
                                                .setCustomId("reason-deny")
                                                .setStyle(TextInputStyle.Paragraph)
                                                .setRequired(true)
                                            )
                                        )

                                        await interaction.showModal(modal)
                                    } else if (interaction.customId === "delete") {
                                        const modal = new ModalBuilder()
                                        .setTitle("Accept Suggestion")
                                        .setCustomId("delete-modal")
                                        .setComponents(
                                            new ActionRowBuilder().setComponents(
                                                new TextInputBuilder()
                                                .setLabel("reason for delete the suggestion")
                                                .setCustomId("reason-delete")
                                                .setStyle(TextInputStyle.Paragraph)
                                                .setRequired(true)
                                            )
                                        )

                                        await interaction.showModal(modal)
                                    }
                                } else if (interaction.isModalSubmit()) {
                                    if (interaction.customId === "accepted-modal") {
                                        const embed = new EmbedBuilder()
                                        .setTitle("Suggestion Accepted")
                                        .setAuthor({name: interaction.user.tag + " accepted the suggestion", iconURL: interaction.user.displayAvatarURL()})
                                        .setDescription(`Suggestion : ${suggestion}`)
                                        .setColor("Green")
                                        .addFields({name: "Status : Accepted", value: interaction.fields.getTextInputValue("reason-accept")})
                                        .setFooter({text: `suggestion sent by ${user}`})
        
                                        gchannel.messages.fetch(message).then(editm => {
                                            editm.edit({
                                                embeds: [embed]
                                            })
                                        })

                                        await interaction.reply({content: `success`, ephemeral: true})
                                    } else if (interaction.customId === "deny-modal") {
                                        const embed = new EmbedBuilder()
                                        .setTitle("Suggestion denied")
                                        .setAuthor({name: interaction.user.tag + " denied the suggestion", iconURL: interaction.user.displayAvatarURL()})
                                        .setDescription(`Suggestion : ${suggestion}`)
                                        .setColor("Red")
                                        .addFields({name: "Status : denied", value: interaction.fields.getTextInputValue("reason-deny")})
                                        .setFooter({text: `suggestion sent by ${user}`})
        
                                        gchannel.messages.fetch(message).then(editm => {
                                            editm.edit({
                                                embeds: [embed]
                                            })
                                        })

                                        await interaction.reply({content: `success`, ephemeral: true})
                                    } else if (interaction.customId === "delete-modal") {
                                        const embed4 = new EmbedBuilder()
                                        .setTitle('Suggestion Deleted')
                                        .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                                        .setDescription(`Suggestion: This suggestions has been deleted`)
                                        .setColor("Grey")
                                        .addFields({name: "Status: Deleted by Mods", value: interaction.fields.getTextInputValue("reason-delete")})

                                        gchannel.messages.fetch(message).then(editm => {
                                            editm.edit({
                                                embeds: [embed4]
                                            })
                                        })
                                        await data.delete()
                                        await interaction.reply({content: `success`, ephemeral: true})
                                    }
                                 }
                            })
                        }   
                    }
                })
                break;
            case "setup":
                Channel.findOne({
                    Guild: interaction.guild.id
                }, async (err, data) => {
                    if (data) data.delete()
                    new Channel({
                        Guild: interaction.guild.id,
                        Channel: channel.id
                    }).save()
                    interaction.reply({content: `I have set the channel to ${channel} for suggest`, ephemeral: true})
                })
                break;
        }
    }
}