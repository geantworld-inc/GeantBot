const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Client, ChatInputCommandInteraction, ChannelType } = require('discord.js');
const DB = require("../../Schemas/ticketSetup")

module.exports = {
    name: "ticket-setup",
    description: "Ticket Systems",
    category: "Tickets Systems",
    UserPerms: ["Administrator"],
    BotPerms: ["Administrator"],
    options: [
        {
            name: "channel",
            description: "Select a channel for ticket create panel",
            type: 7,
            channelType: ChannelType.GuildText,
            required: true
        },
        {
            name: "category",
            description: "Select Category for ticket creations",
            type: 7,
            channelType: ChannelType.GuildCategory,
            required: true
        },
        {
            name: "transcripts",
            description: "Select the transcripts channels",
            type: 7,
            channelType: ChannelType.GuildText,
            required: true
        },
        {
            name: "handlers",
            description: "Select the ticket handler's role.",
            type: 8,
            required: true
        },
        {
            name: "everyone",
            description: "Provide the @everyone role, its important",
            type: 8,
            required: true
        },
        {
            name: "description",
            description: "set the description",
            type: 3,
            required: true
        },
        {
            name: "button",
            description: "give button name and emoji (with ,)",
            type: 3,
            required: true
        }
    ],
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const { guild, options } = interaction

        try {
            const Channel = options.getChannel("channel")
            const Category = options.getChannel("category")
            const Transcripts = options.getChannel("transcripts")
            const Handlers = options.getRole("handlers")
            const Everyone = options.getRole("everyone")

            const Description = options.getString("description")

            const Buttons1 = options.getString("button").split(",")

            const Emoji1 = Buttons1[1]

            await DB.findOneAndUpdate({ GuildID: guild.id }, {
                Channel: Channel.id,
                Category: Category.id,
                Transcripts: Transcripts.id,
                Handlers: Handlers.id,
                Everyone: Everyone.id,
                Description: Description.id,
                Buttons: [Buttons1[1]]
            },
            {
                new: true,
                upsert: true,
            })

            const Embed = new EmbedBuilder()
            .setAuthor({
                name: `${guild.name} | Ticket System`,
                iconURL: `${guild.iconURL({dynamic: true})}`
            })
            .setDescription(Description)
            .setColor("Green")
    
            const Buttons = new ActionRowBuilder()
            Buttons.addComponents(
                new ButtonBuilder()
                .setCustomId("ticket")
                .setLabel(Buttons1[0])
                .setStyle(ButtonStyle.Primary)
                .setEmoji(Emoji1)
            )
    
            await guild.channels.cache.get(Channel.id).send({embeds: [Embed], components: [Buttons]})
    
            interaction.reply({content: `success`, ephemeral: true})    
        } catch (error) {
            console.log(error)
        } 
    }
}