const { Client, ChatInputCommandInteraction } = require("discord.js")
const Reply = require("../../Systems/Reply")
const EditReply = require("../../Systems/EditReply")

module.exports = {
    name: "simulate",
    description: "simulate join or left the guild",
    UserPerms: ["Administrator"],
    BotPerms: ["Administrator"],
    category: "Owner",
    options: [
        {
            name: `options`,
            description: `Choose an option`,
            type:3,
            required: true,
            choices: [
                {
                    name: "Join",
                    value: "join"
                },
                {
                    name: "Leave",
                    value: "leave"
                }
            ]
        }
    ],
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {

        const { options, user, member } = interaction


        const Options = options.getString("options")

        if (user.id !== "689466766916714532") return Reply(interaction, "❌", "This command is Classified!", true)

        switch (Options) {
            case "join": {
                Reply(interaction, "✅", "Simulated join Event", true)

                client.emit("guildMemberAdd", member)
            }
                break;
            
            case "leave": {
                Reply(interaction, "✅", "Simulatede leave Event", true)

                client.emit("guildMemberRemove", member)
            }
                break;
        }
    }
}