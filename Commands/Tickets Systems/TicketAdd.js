const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Client, ChatInputCommandInteraction } = require('discord.js');
const db = require("../../Schemas/ticket");

module.exports = {
    name: "ticket-setup",
    description: "Ticket Systems",
    category: "Tickets Systems",
    UserPerms: ["Administrator"],
    BotPerms: ["Administrator"],
    options: [
        {
            name: "action",
            description: "Add or remove member from this tickets",
            type: 3,
            required: true,
            choices: [
                {
                    name: "Add",
                    value: "add"
                },
                {
                    name: "Remove",
                    value: "remove"
                }
            ]
        },
        {
            name: "member",
            description: "Select a member",
            type: 6,
            required: true
        }
    ],
    /**
     * @param {Client} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute (interaction, client) {
        const { guildId, options, channel } = interaction

        const Action = options.getString("action")
        const Member = options.getMember("member")

        const Embed = new EmbedBuilder()

        switch(Action) {
            case "add":
                db.findOne({ GuildID: guildId, ChannelID: channel.id }, async (err, docs) => {
                    if (err) throw err
                    if(!docs) return interaction.reply({embeds: [Embed.setDescription("This channel is not tied with a ticket")], ephemeral: true})

                    if (docs.MembersID.includes(Member.id)) return interaction.reply({embeds: [Embed.setDescription("This member is already added to this ticket.")], ephemeral: true})
                    docs.MembersID.push(Member.id)

                    channel.permissionOverwrites.edit(Member.id, {
                        ViewChannel: true,
                        SendMessages: true,
                        ReadMessageHistory: true
                    })

                    interaction.reply({embeds: [Embed.setDescription(`${Member} has been added to this ticket`)]})

                    docs.save()
                })
                break;
            case "remove":
                db.findOne({ GuildID: guildId, ChannelID: channel.id }, async (err, docs) => {
                    if (err) throw err
                    if(!docs) return interaction.reply({embeds: [Embed.setDescription("This channel is not tied with a ticket")], ephemeral: true})

                    if (!docs.MembersID.includes(Member.id)) return interaction.reply({embeds: [Embed.setDescription("This member is not in this ticket")], ephemeral: true})
                    docs.MembersID.remove(Member.id)

                    channel.permissionOverwrites.edit(Member.id, {
                        ViewChannel: false,
                        SendMessages: false,
                        ReadMessageHistory: false
                    })

                    interaction.reply({embeds: [Embed.setDescription(`${Member} has been removed to this ticket`)]})

                    docs.save()
                })
                break;
        }
    }
}