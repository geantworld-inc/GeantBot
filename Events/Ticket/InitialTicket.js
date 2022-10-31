const { Client, CommandInteraction, InteractionType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { ApplicationCommand } = InteractionType
const { ParentID, EveryoneID } = process.env
const DB = require("../../Schemas/ticket")
const TS = require("../../Schemas/ticketSetup")

module.exports = {
    name: "interactionCreate",
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
    */
   async execute(interaction, client) {
    if (!interaction.isButton()) return;
    const { guild, member, customId } = interaction

    const Data = await TS.findOne({GuildID: guild.id})
    if(!Data) return console.log("this server has not data")

    if(!Data.Buttons.includes(customId)) return;

    const ID = Math.floor(Math.random() * 90000) + 10000

    await guild.channels.create({
        name: `ticket - ${ID}`,
        parent: Data.Category,
        permissionOverwrites: [
            {
                id: member.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AddReactions]
            },
            {
                id: Data.Everyone,
                deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AddReactions]
            }
        ]
    }).then(async(channel) => {
        await DB.create({
            GuildID: guild.id,
            MembersID: member.id,
            TicketID: ID,
            ChannelID: channel.id,
            Closed: false,
            Locked: false,
            Type: customId,
            Claimed: false
        })
    

        const Embed = new EmbedBuilder()
        .setAuthor({
            name: `${guild.name} | ticket: ${ID}`,
            iconURL: guild.iconURL()
        })
        .setDescription("Please wait patiently for a response from the staff team, in the mean while, describe your issue in as much detail as possible")
        .setFooter({text: "The buttons below are Staff only Buttons"})

        const Buttons = new ActionRowBuilder()
        Buttons.addComponents(
        new ButtonBuilder()
        .setCustomId("close")
        .setLabel("close")
        .setStyle(ButtonStyle.Danger)
        .setEmoji("❌"),
        new ButtonBuilder()
        .setCustomId("lock")
        .setLabel("lock")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🔒"),
        new ButtonBuilder()
        .setCustomId("unlock")
        .setLabel("unlock")
        .setStyle(ButtonStyle.Success)
        .setEmoji("🔓"),
        new ButtonBuilder()
        .setCustomId("claim")
        .setLabel("claim")
        .setStyle(ButtonStyle.Primary)
        .setEmoji("👋"),
        )

        channel.send({content: `${member} here is your ticket`, embeds: [Embed], components: [Buttons]})

        interaction.reply({content: `${member} your ticket has been created: ${channel}`, ephemeral: true})
    })
   }
}