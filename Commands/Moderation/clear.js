const { Client, ChatInputCommandInteraction, EmbedBuilder } = require("discord.js")
const Reply = require("../../Systems/Reply")

module.exports = {
    name: "clear",
    description: "Clear a specific amount of messages from a target or channel.",
    category: "Moderation",
    UserPerms: ["ManageMessages"],
    BotPerms: ["ManageMessages"],
    options: [
        {
            name: "amount",
            description: "Amount of messages to clear.",
            type: 4,
            required: true,
        },
        {
            name: "target",
            description: "Select a target to clear their messages.",
            type: 6,
            required: false
        }
    ],
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        await interaction.deferReply({ephemeral: true})
        const {channel, options} = interaction;

        const amount = options.getInteger('amount');
        const target = options.getUser("target");

        if (amount > 99 || amount < 1) return interaction.editReply({content: `Please select a number **between** 100 and 1`})

        const messages = await channel.messages.fetch({
            limit: amount +1,
        });

        const res = new EmbedBuilder()
            .setColor("Green")

        if(target) {
            let i = 0;
            const filtered = [];

            (await messages).filter((msg) =>{
                if(msg.author.id === target.id && amount > i) {
                    filtered.push(msg);
                    i++;
                }
            });

            await channel.bulkDelete(filtered).then(messages => {
                res.setDescription(`Succesfully deleted ${messages.size} messages from ${target}.`);
                interaction.editReply({embeds: [res]});
            });
        } else {
            await channel.bulkDelete(amount, true).then(messages => {
                res.setDescription(`Succesfully deleted ${messages.size} messages from the channel.`);
                interaction.editReply({embeds: [res]});
            });
        }
    }
}