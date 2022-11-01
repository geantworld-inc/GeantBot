const { Client, ChatInputCommandInteraction, ChannelType, EmbedBuilder } = require("discord.js")
const Reply = require("../../Systems/Reply")
const ms = require("ms")

module.exports = {
    name: "giveaway",
    description: "Giveaway system",
    UserPerms: ["Administrator"],
    BotPerms: ["Administrator"],
    category: "Giveaway",
    options: [
        {
            name: "start",
            description: "start a giveaway",
            type: 1,
            options: [
                {
                    name: "duration",
                    description: "Provide a duration for this giveaway (1m, 1h, 1d)",
                    type: 3,
                    required: true
                },
                {
                    name: "winners",
                    description: "Select the amount of winners for this giveaway",
                    type: 4,
                    required: true
                },
                {
                    name: "prize",
                    description: "Provide the name of the prize",
                    type: 3,
                    required: true
                },
                {
                    name: "channel",
                    description: "Select a channel to send the giveaway",
                    type: 7,
                    channelTypes: [ChannelType.GuildText]
                }
            ]
        },
        {
            name: "actions",
            description: "Options for giveaways",
            type: 1,
            options: [
                {
                    name: "options",
                    description: "Select an options",
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: "end",
                            value: "end"
                        },
                        {
                            name: "pause",
                            value: "pause"
                        },
                        {
                            name: "unpause",
                            value: "unpause"
                        },
                        {
                            name: "reroll",
                            value: "reroll"
                        },
                        {
                            name: "delete",
                            value: "delete"
                        }
                    ]
                },
                {
                    name: "query",
                    description: "Provide the message id of the giveaway",
                    type: 3,
                    required: true
                }
            ]
        }
    ],
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const { options } = interaction

        const Sub = options.getSubcommand()

        const errorEmbed = new EmbedBuilder()
        .setColor("Red")

        const successEmbed = new EmbedBuilder()
        .setColor("Green")

        switch (Sub) {
            case "start": {
                const gchannel = interaction.options.getChannel("channel") || interaction.channel;
                const duration = interaction.options.getString("duration")
                const winnercount = interaction.options.getInteger("winners")
                const prize = interaction.options.getString("prize")

                client.giveawaysManager.start(gchannel, {
                    duration: ms(duration),
                    prize: prize,
                    winnerCount: winnercount,
                    hostedBy: interaction.user
                })
                .then(async () => {
                    successEmbed.setDescription("Giveaway was successfully started")
                    interaction.reply({embeds: [successEmbed], ephemeral: true})
                }).catch((err) => {
                    errorEmbed.setDescription(`error: ${err}`)
                    interaction.reply({embeds: [errorEmbed], ephemeral: true})
                    console.log(err)
                });
            }
            break;

            case "actions": {
                const choice = options.getString("options")
                const query = interaction.options.getString('query');
                const giveaway = client.giveawaysManager.giveaways.find((g) => g.guildId === interaction.guildId && g.messageId === query) || client.giveawaysManager.giveaways.find((g) => g.guildId === interaction.guildId && g.prize === query);

                if (!giveaway) return interaction.reply({content: `Unable to find a giveaway for \`${query}\`.`, ephemeral: true});
                switch(choice) {
                    case "end": {
                        const messageId = interaction.options.getString('query');
                        client.giveawaysManager
                            .end(messageId)
                            .then(() => {
                                return interaction.reply({content: 'Success! Giveaway ended!', ephemeral: true});
                            })
                            .catch((err) => {
                                return interaction.reply({content: `An error has occurred, please check and try again.\n\`${err}\``, ephemeral: true});
                            });
                    }
                    break;

                    case "pause": {
                        const messageId = interaction.options.getString('query');
                        client.giveawaysManager
                            .pause(messageId)
                            .then(() => {
                               return interaction.reply({content: 'Success! Giveaway paused!', ephemeral: true});
                            })
                            .catch((err) => {
                                return interaction.reply({content: `An error has occurred, please check and try again.\n\`${err}\``, ephemeral: true});
                            });
                    }
                    break;

                    case "unpause": {
                        const messageId = interaction.options.getString('query');
                        client.giveawaysManager
                            .unpause(messageId)
                            .then(() => {
                                return interaction.reply({content: 'Success! Giveaway unpaused!', ephemeral: true});
                            })
                            .catch((err) => {
                                return interaction.reply({content: `An error has occurred, please check and try again.\n\`${err}\``, ephemeral: true});
                            });
                    }
                    break;

                    case "reroll": {
                        const messageId = interaction.options.getString('query');
                        client.giveawaysManager
                            .reroll(messageId)
                            .then(() => {
                                return interaction.reply({content: 'Success! Giveaway rerolled!', ephemeral: true});
                            })
                            .catch((err) => {
                                return interaction.reply({content: `An error has occurred, please check and try again.\n\`${err}\``, ephemeral: true});
                            });
                    }
                    break;

                    case "delete": {
                        const messageId = interaction.options.getString('query');
                        client.giveawaysManager
                            .delete(messageId)
                            .then(() => {
                                return interaction.reply({content: 'Success! Giveaway deleted!', ephemeral: true});
                            })
                            .catch((err) => {
                                return interaction.reply({content: `An error has occurred, please check and try again.\n\`${err}\``, ephemeral: true});
                            });
                    }
                    break;
                }
            }
            break;

            default : {
                console.log("error")
            }
        }
    }
}