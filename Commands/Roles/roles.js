const { Client, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, SelectMenuBuilder } = require("discord.js")
const Reply = require("../../Systems/Reply")
const rrSchema = require("../../Schemas/ReactionRoles")

module.exports = {
    name: "reaction-roles",
    description: "Roles systems",
    UserPerms: ["ManageGuild"],
    BotPerms: ["ManageGuild"],
    category: "Roles",
    options: [
        {
            name: "add",
            description: "Add a role",
            type: 1,
            options: [
                {
                    name: "role",
                    description: "Role to be assigned",
                    type: 8,
                    required: true
                },
                {
                    name: "description",
                    description: "Description of the role",
                    type: 3,
                    required: false
                },
                {
                    name: "emoji",
                    description: "Emoji of the role",
                    type: 3,
                    required: false
                }
            ]
        },
        {
            name: "panel",
            description: "Reaction Roles panel",
            type: 1
        },
        {
            name: "remove",
            description: "Remove a role",
            type: 1,
            options: [
                {
                    name: "role",
                    description: "Role to be assigned",
                    type: 8,
                    required: true
                }
            ] 
        }
    ],
    /**
     * @param {Client} client
     * @param {ChatInputCommandInteraction} interaction
     */
    async execute(interaction, client) {
        const { options, guildId, user, member, guild, channel } = interaction

        const sub = options.getSubcommand(["add", "panel", "remove"])
        const role = options.getRole("role")
        const description = options.getString("description")
        const emoji = options.getString("emoji")

        switch (sub) {
            case "add":
                try {

                    if (role.position >= member.roles.highest.position)
                        return interaction.reply({ content: "I don't have permissions for that.", ephemeral: true });
        
                    const data = await rrSchema.findOne({ GuildID: guildId });
        
                    const newRole = {
                        roleId: role.id,
                        roleDescription: description || "No description.",
                        roleEmoji: emoji || "",
                    }
        
                    if (data) {
                        let roleData = data.roles.find((x) => x.roleId === role.id);
        
                        if (roleData) {
                            roleData = newRoleData;
                        } else {
                            data.roles = [...data.roles, newRole]
                        }
        
                        await data.save();
                    } else {
                        await rrSchema.create({
                            GuildID: guildId,
                            roles: newRole,
                        });
                    }
        
                    return interaction.reply({ content: `Created new role **${role.name}**` });
        
                } catch (err) {
                    console.log(err);
                }
                break;
            case "panel":
                try {
                    const data = await rrSchema.findOne({ GuildID: guildId });
        
                    if (!data.roles.length > 0)
                        return interaction.reply({ content: "This server does not have any data.", ephemeral: true });
        
                    const panelEmbed = new EmbedBuilder()
                        .setDescription("Please select a role below")
                        .setColor("Aqua")
        
                    const options = data.roles.map(x => {
                        const role = guild.roles.cache.get(x.roleId);
        
                        return {
                            label: role.name,
                            value: role.id,
                            description: x.roleDescription,
                            emoji: x.roleEmoji || undefined
                        };
                    });
        
                    const menuComponents = [
                        new ActionRowBuilder().addComponents(
                            new SelectMenuBuilder()
                                .setCustomId('reaction-roles')
                                .setMaxValues(options.length)
                                .addOptions(options),
                        ),
                    ];
        
                    channel.send({ embeds: [panelEmbed], components: menuComponents });
        
                    return interaction.reply({ content: "Succesfully sent your panel.", ephemeral: true });
                } catch (err) {
                    console.log(err);
                }
                break;
            case "remove":
                try {

                    const data = await rrSchema.findOne({ GuildID: guildId });
        
                    if (!data)
                        return interaction.reply({ content: "This server does not have any data.", ephemeral: true });
        
                    const roles = data.roles;
                    const findRole = roles.find((r) => r.roleId === role.id);
        
                    if (!findRole)
                        return interaction.reply({ content: "This role does not exist.", ephemeral: true });
        
                    const filteredRoles = roles.filter((r) => r.roleId !== role.id);
                    data.roles = filteredRoles;
        
                    await data.save();
        
                    return interaction.reply({ content: `Removed role **${role.name}**` });
        
                } catch (err) {
                    console.log(err);
                }
                break;
        }
    }
}