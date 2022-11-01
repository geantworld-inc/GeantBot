const { Client, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js")
const Reply = require("../../Systems/Reply")
const DB = require("../../Schemas/WarningsDB")

module.exports = {
    name: "warnings",
    description: "Warn a member or View all warnings of user",
    UserPerms: ["ModerateMembers"],
    BotPerms: ["ModerateMembers"],
    category: "Moderation",
    options: [
        {
            name: "add",
            description: "Add a warning of a user",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "Select a user",
                    type: 6,
                    required: true
                },
                {
                    name: "reason",
                    description: "Provide a reason",
                    type: 3,
                    required: false
                },
                {
                    name: "evidence",
                    description: "Provide a evidence",
                    type: 3,
                    required: false
                }
            ]
        },
        {
            name: "remove",
            description: "Remove a warning of a user",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "Select a user",
                    type: 6,
                    required: true
                },
                {
                    name: "id",
                    description: "Provide the warning id",
                    type: 4,
                    required: true
                }
            ]
        },
        {
            name: "check",
            description: "check all warning of a user",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "Select a user",
                    type: 6,
                    required: true
                }, 
            ]
        },
        {
            name: "clear",
            description: "clear all warning of a user",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "Select a user",
                    type: 6,
                    required: true
                }, 
            ]
        }
    ],
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const { options, guildId, user, member } = interaction

        const sub = options.getSubcommand(["add", "check", "remove", "clear"])
        const target = options.getUser("user")
        const reason = options.getString("reason") || "No reason provided"
        const evidence = options.getString("evidence") || "No evidence provided"
        const warnId = options.getInteger("id") - 1
        const warnDate = new Date(interaction.createdTimestamp).toLocaleDateString()

        const userTag = `${target.username}#${target.discriminator}`

        const embed = new EmbedBuilder()

        switch (sub) {
            case "add":
                DB.findOne({GuildId: guildId, UserId: target.id, UserTag: userTag}, async (err, data) => {
                    if (err) throw err

                    if (!data) {
                        data = new DB({
                            GuildId: guildId,
                            UserId: target.id,
                            UserTag: userTag,
                            Content: [
                                {
                                    ExecuterId: user.id,
                                    ExecuterTag: user.tag,
                                    Reason: reason,
                                    Evidence: evidence,
                                    Date: warnDate
                                }
                            ]
                        })
                    } else {
                        const WarnContent = {
                            ExecuterId: user.id,
                            ExecuterTag: user.tag,
                            Reason: reason,
                            Evidence: evidence,
                            Date: warnDate
                        }
                        data.Content.push(WarnContent)
                    }
                    data.save()
                })

                embed.setColor("Green")
                    .setDescription(`
                    Warning added: ${userTag} | ||${target.id}||
                    **Reason**: ${reason}
                    **Evidence**: ${evidence}
                    `)
                    .setFooter({text: `${member.user.tag}`, iconURL: member.displayAvatarURL({ dynamic: true })})
                    .setTimestamp()

                    interaction.reply({ embeds: [embed] })
                break;
            case "check":
                DB.findOne({GuildId: guildId, UserId: target.id, UserTag: userTag}, async (err, data) => {
                    if (err) throw err;

                    if (data) {
                        embed.setColor("Green")
                            .setDescription(`${data.Content.map(
                                (w, i) => 
                                    `**ID** : ${i + 1}
                                **By** : ${w.ExecuterTag}
                                **Date**: ${w.Date}
                                **Reason**: ${w.Reason}
                                **Evidence** ${w.Evidence}\n\n
                                `
                            ).join(" ")}`)
                            .setFooter({text: member.user.tag, iconURL: member.displayAvatarURL({ dynamic: true })})
                            .setTimestamp()

                        interaction.reply({embeds: [embed]})
                    } else {
                        embed.setColor("Red")
                            .setDescription(`${userTag} | ||${target.id}|| has no warnings`)
                            .setFooter({text: member.user.tag, iconURL: member.displayAvatarURL({ dynamic: true })})
                            .setTimestamp()

                        interaction.reply({embeds: [embed]})
                    }
                })
                break;
            case "remove":
                DB.findOne({GuildId: guildId, UserId: target.id, UserTag: userTag}, async (err, data) => {
                    if (err) throw err;

                    if (data) {
                        data.Content.splice(warnId, 1)
                        data.save()


                        embed.setColor("Green")
                        .setDescription(`${userTag}'s warning id: ${warnId + 1} has been removed`)
                        .setFooter({text: member.user.tag, iconURL: member.displayAvatarURL({ dynamic: true })})
                        .setTimestamp()

                        interaction.reply({embeds: [embed]})
                    } else {
                        embed.setColor("Red")
                            .setDescription(`${userTag} | ||${target.id}|| has no warnings`)
                            .setFooter({text: member.user.tag, iconURL: member.displayAvatarURL({ dynamic: true })})
                            .setTimestamp()

                        interaction.reply({embeds: [embed]})
                    }
                })
                break;
            case "clear":
                DB.findOne({GuildId: guildId, UserId: target.id, UserTag: userTag}, async (err, data) => {
                    if (err) throw err;

                    if (data) {
                        await DB.findOneAndDelete({GuildId: guildId, UserId: target.id, UserTag: userTag})


                        embed.setColor("Green")
                        .setDescription(`${userTag}'s warnings were cleared`)
                        .setFooter({text: member.user.tag, iconURL: member.displayAvatarURL({ dynamic: true })})
                        .setTimestamp()

                        interaction.reply({embeds: [embed]})
                    } else {
                        embed.setColor("Red")
                            .setDescription(`${userTag} | ||${target.id}|| has no warnings`)
                            .setFooter({text: member.user.tag, iconURL: member.displayAvatarURL({ dynamic: true })})
                            .setTimestamp()

                        interaction.reply({embeds: [embed]})
                    }
                })
                break;
        }
    }
}