const { EmbedBuilder, ChatInputCommandInteraction, Client, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require("discord.js")
const { OpenId } = process.env
const DB = require("../../Schemas/ticketSetup")

module.exports = {
    name: "ticket-setup",
    description: "Setup ticket",
    category: "Tickets Systems",
    UserPerms: ["Administrator"],
    BotPerms: ["Administrator"],
    options: [
        {
            name: "channel",
            description: "Select a channel for ticket create panel",
            type: 7,
            ChannelTypes: ChannelType.GuildText,
            required: true
        },
        {
            name: "category",
            description: "Select Category for ticket creation",
            type: 7,
            ChannelTypes: ChannelType.GuildCategory,
            required: true
        },
        {
            name: "transcripts",
            description: "Select the transcripts channels",
            type: 7,
            ChannelTypes: ChannelType.GuildText,
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
            description: "Set description",
            type: 3,
            required: true
        },
        {
            name: "button",
            description: "Give your button a name and emoji (separe with ,)",
            type: 3,
            required: true
        },
    ],
    /**
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
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

            const emoji1 = Buttons1[1]

            await DB.findOneAndUpdate({ GuildID: guild.id }, {
                Channel: Channel.id,
                Category: Category.id,
                Transcripts: Transcripts.id,
                Handlers: Handlers.id,
                Everyone: Everyone.id,
                Description: Description.id,
                Buttons: [Buttons1[0]]
            },
            {
                new: true,
                upsert: true,
            })

            const Embed = new EmbedBuilder()
            .setAuthor({
                name: `${guild.name} | ticket systems`,
                iconURL: guild.iconURL()
            })
            .setDescription(Description)
            .setColor("Green")
    
            const Buttons = new ActionRowBuilder()
            Buttons.addComponents(
                new ButtonBuilder()
                .setCustomId(Buttons1[0])
                .setLabel(Buttons1[0])
                .setStyle(ButtonStyle.Primary)
                .setEmoji(emoji1)
            )
    
            await guild.channels.cache.get(Channel.id).send({embeds: [Embed], components: [Buttons]})
    
            interaction.reply({content: `success`, ephemeral: true})    
        } catch (error) {
            console.log(error)
        }
    }
}