const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, Client, ChatInputCommandInteraction, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const Channel = require("../../Schemas/channelSuggest")
const suggests = require("../../Schemas/suggestDB")

module.exports = {
    name: "suggest",
    description: "suggest system",
    category: "Suggestion",
    options: [
        {
            name: "create",
            description: "create a suggest",
            type: 1,
            options: [
                {
                    name: "suggest",
                    description: "suggest",
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: "panel",
            description: "Admin panel",
            type: 1,
            options: [
                {
                    name: "msg-id",
                    description: "Provide the message id for access the panel",
                    type: 3,
                    required: true
                }
            ]
        },
        {
            name: "setup",
            description: "setup the system",
            type: 1,
            options: [
                {
                    name: "channel",
                    description: "Select a valid channel",
                    type: 7,
                    required: true,
                    channelTypes: [ChannelType.GuildText]
                }
            ]

        }
    ],
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute (interaction, client) {
        const sub = interaction.options.getSubcommand(["create", "panel", "setup"])
        const suggest = interaction.options.getString("suggest")
        const id = interaction.options.getString("msg-id")
        const channel = interaction.options.getChannel("channel")

        switch (sub) {
            case "create":
                Channel.findOne({
                    Guild: interaction.guild.id
                }, async (err, data) => {
                    const pass = gen()
                    const channel = interaction.guild.channels.cache.get(data.Channel)
                    if(!data) return interaction.reply({content: 'Suggestion channel not set...'})
                    if(data) {
                        const embed = new EmbedBuilder()
                            .setTitle('Suggestion')
                            .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                            .setDescription(`Suggestion: ${suggest}`)
                            .setColor('Blue')
                            .addFields({name: "Status: Waiting", value: "⏳"})
    
                            channel.send({
                                embeds: [embed]
                            }).then(m => {
                                interaction.reply({content: 'suggestion sent', ephemeral: true})
                                m.react("👍")
                                m.react("👎")
                                new suggests({
                                    message: m.id,
                                    token: m.id,
                                    suggestion: suggest,
                                    user: interaction.user.id,
                                    guild: interaction.guild.id
                                }).save()
                            })
                    }
                })
                break;
            case "panel":
                if (interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
                    suggests.findOne({
                        token: id
                    }, async (err, data) => {
                        if (!data) return interaction.reply({content: `${id} : data no found ! please try again`, ephemeral: true})
                        const guild = data.guild
                        const message = data.message
                        const suggestion = data.suggestion
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

                                            interaction.showModal(modal)
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

                                            interaction.showModal(modal)
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

                                            interaction.showModal(modal)
                                        }
                                    } else if (interaction.isModalSubmit()) {
                                        if (interaction.customId === "accepted-modal") {
                                            const embed2 = new EmbedBuilder()
                                            .setTitle('Suggestion Accepted')
                                            .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                                            .setDescription(`Suggestion: ${suggestion}`)
                                            .setColor('Green')
                                            .addFields({name: "Status: Accepted", value: interaction.fields.getTextInputValue("reason-accept")})

                                            gchannel.messages.fetch(message).then(editm => {
                                                editm.edit({
                                                    embeds: [embed2]
                                                })
                                            })
                                            interaction.reply({content: `success`, ephemeral: true})
                                        } else if (interaction.customId === "deny-modal") {
                                            const embed3 = new EmbedBuilder()
                                            .setTitle('Suggestion Deny')
                                            .setAuthor({name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL()})
                                            .setDescription(`Suggestion: ${suggestion}`)
                                            .setColor('Red')
                                            .addFields({name: "Status: Deny", value: interaction.fields.getTextInputValue("reason-deny")})

                                            gchannel.messages.fetch(message).then(editm => {
                                                editm.edit({
                                                    embeds: [embed3]
                                                })
                                            })
                                            interaction.reply({content: `success`, ephemeral: true})
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
                                            interaction.reply({content: `success`, ephemeral: true})
                                        }
                                     }
                                })
                            }   
                        }
                    })
                } else {
                    interaction.reply({content: `You don't have perms for this`, ephemeral: true})
                }
                break;
            case "setup":
                if (interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
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
                } else {
                    interaction.reply({content: "You don't have perms", ephemeral: true})
                }
                break;
        }
    }
}

function gen() {
    var length = 12,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
    for(var i = 0, n =charset.length; i < length; i++) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}