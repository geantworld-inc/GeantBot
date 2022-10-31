const { Client, CommandInteraction, InteractionType, EmbedBuilder } = require("discord.js")
const { ApplicationCommand } = InteractionType
const Reply = require("../../Systems/Reply")
const polls = require("../../Schemas/pollDB")

module.exports = {
    name: "interactionCreate",
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
    */
   async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const pol = await polls.findOne({ message: interaction.message.id });

    if (!pol) return;

    await interaction.deferReply({
        ephemeral: true
    });

    if (pol.voters.includes(interaction.user.id)) return interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Already Voted!")
        ]
    });

    pol.votes = pol.votes || {};

    if (pol.votes[interaction.customId]) pol.votes[interaction.customId] += 1
    else pol.votes[interaction.customId] = 1;

    pol.voters.push(interaction.user.id);

    await polls.findOneAndUpdate({ message: pol.message }, pol);

    interaction.editReply({
        embeds: [new EmbedBuilder()
            .setColor("Green")
            .setTitle("✅ Voted Successfully")
        ]
    });

    const m = interaction.message;

    m.edit({
        components: m.components.map(row => {
            row.components = row.components?.map(v => {
                v.label = `${pol.votes[v.customId] || 0}`;

                return v;
            });

            return row;
        })
    })
    }
}