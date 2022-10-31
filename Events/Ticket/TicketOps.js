const { Client, CommandInteraction, InteractionType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const { ApplicationCommand } = InteractionType
const { ParentID, EveryoneID, TranscriptsId } = process.env
const DB = require("../../Schemas/ticket")
const TS = require("../../Schemas/ticketSetup")
const { createTranscript } = require("discord-html-transcripts")

module.exports = {
    name: "interactionCreate",
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
    */
   async execute(interaction, client) {
    if (!interaction.isButton()) return;
    const { guild, member, customId, channel } = interaction
    if(!["close", "lock", "unlock", "claim"].includes(customId)) return

    const Data = await TS.findOne({GuildID: guild.id})
    if(!Data) return 

    const Embed = new EmbedBuilder().setColor("Blue")

    DB.findOne({ChannelID: channel.id}, async (err, docs) => {
        if(err) throw err;
        if(!docs) return interaction.reply({content: `No data found, please delete manual`, ephemeral: true})

        switch(customId) {
            case "lock":
                if (docs.Locked == true) return interaction.reply({content: `this ticket is already locked`, ephemeral: true})
                await DB.updateOne({ChannelID: channel.id}, {Locked: true})
                Embed.setDescription("🔒 | this ticket is now locked !")
                        docs.MembersID.forEach((m) => {
                            channel.permissionOverwrites.edit(m, {
                                SendMessages: false
                            })
                        })

                interaction.reply({embeds: [Embed]})
                break;
            case "unlock":
                if (docs.Locked == false) return interaction.reply({content: `this ticket is already unlocked`, ephemeral: true})
                await DB.updateOne({ChannelID: channel.id}, {Locked: false})
                Embed.setDescription("🔓 | this ticket is now unlocked !")
                docs.MembersID.forEach((m) => {
                    channel.permissionOverwrites.edit(m, {
                        SendMessages: true
                    })
                })

                interaction.reply({embeds: [Embed]})
                break;
            case "close":
                if (docs.Closed == true) return interaction.reply({content: `this ticket is already closed`, ephemeral: true})
                        const attachment = await createTranscript(channel, {
                            limit: -1,
                            returnBuffer: false,
                            fileName: `${docs.Type} - ${docs.TicketID}.html`
                        })
                        await DB.updateOne({ ChannelID: channel.id }, {Closed: true})
                        
                        const Message = await guild.channels.cache.get(Data.Transcripts).send({embeds: [Embed.setTitle(`Transcript Type: ${docs.Type}\nID: ${docs.TicketID}`)], files: [attachment]})
    
                        interaction.reply({embeds: [Embed.setDescription(`transcript is now saved [TRANSCRIPT](${Message.url})`)]})
    
                        setTimeout(() => {
                            channel.delete();
                        }, 10 * 1000)
                break;
            case "claim":
                if (docs.Claimed == true) return interaction.reply({content: `this ticket is already been claimed by <@${docs.ClaimedBy}>`, ephemeral: true})

                await DB.updateOne({ChannelID: channel.id}, {Claimed: true, ClaimedBy: member.id})

                Embed.setDescription("This ticket is Now claimed by <@" + member + ">")
                interaction.reply({embeds: [Embed]})
                break;
        }
    })
   }
}