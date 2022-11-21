const { Client, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js")
const DB = require("../../Schemas/WarningsDB")

module.exports = {
    data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("warnings systems")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(subcommand => 
        subcommand.setName("add")
        .setDescription("add a warning")
        .addUserOption(option => option.setName("user").setDescription("provid a user").setRequired(true))
        .addStringOption(option => option.setName("reason").setDescription("provid a reason").setRequired(false)))
    .addSubcommand(subcommand => 
        subcommand.setName("remove")
        .setDescription("remove a warning")
        .addUserOption(option => option.setName("user").setDescription("provid a user").setRequired(true))
        .addIntegerOption(option => option.setName("id").setDescription("provid a warn id").setRequired(true)))
    .addSubcommand(subcommand => 
        subcommand.setName("clear")
        .setDescription("clear all warnings")
        .addUserOption(option => option.setName("user").setDescription("provid a user").setRequired(true)))
    .addSubcommand(subcommand => 
        subcommand.setName("check")
        .setDescription("check warnings")
        .addUserOption(option => option.setName("user").setDescription("provid a user").setRequired(true))),
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const { options, guildId, user, member } = interaction

        const sub = options.getSubcommand(["add", "check", "remove", "clear"])
        const target = options.getUser("user")
        const reason = options.getString("reason") || "No reason provided"
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
                                    Date: warnDate
                                }
                            ]
                        })
                    } else {
                        const WarnContent = {
                            ExecuterId: user.id,
                            ExecuterTag: user.tag,
                            Reason: reason,
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
                                **Reason**: ${w.Reason}\n\n
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