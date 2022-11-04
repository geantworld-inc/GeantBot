const { Perms } = require("../Validation/Permissions")
const { Client } = require("discord.js")
const ms = require("ms")
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

/**
 * @param { Client } client
 */
module.exports = async (client, PG, Ascii) => {
    const Table = new Ascii("Commands Loaded")

    let CommandsArray = []

    const commandFiles = await PG(`${process.cwd()}/Commands/*/*.js`)

    commandFiles.map(async (file) => {
        const command = require(file)

        if (!command.name) return Table.addRow(file.split("/")[7], "FAILED", "Missing a Name")
        if (!command.context && !command.description) return Table.addRow(command.name, "FAILED", "Missing a Description")
        if (command.UserPerms)
            if (command.UserPerms.every(perms => Perms.includes(perms))) command.default_member_permissions = false
            else return Table.addRow(command.name, "FAILED", "User Perms is Invalid")
        client.commands.set(command.name, command)
        CommandsArray.push(command)

        await Table.addRow(command.name, "SUCCESSFUL")
    })

    console.log(Table.toString())

    const rest = new REST({ version: '9'}).setToken(process.env.TOKEN);
        try {
            console.log("Commands Loading...")

            await rest.put(Routes.applicationCommands(process.env.clientId, process.env.guildId), {
                body: CommandsArray,
            });

            console.log("Commands loaded with no errors :)")
        } catch (error) {
            console.error(error);
        }
}