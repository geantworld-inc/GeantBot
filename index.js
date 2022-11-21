const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js")
const { Guilds, GuildMembers, GuildMessages } = GatewayIntentBits
const { Channel, GuildMember, Message, Reaction, ThreadMember, User, GuildScheduledEvent } = Partials
const { loadCommands } = require("./Handlers/commandHandler")
const { loadEvents }  = require("./Handlers/eventHandler")
const { err } = require("./Handlers/error")
require("dotenv").config()
const ms = require("ms")

const client = new Client({
    intents: 131071,
    partials: [Channel, GuildMember, Message, Reaction, ThreadMember, User, GuildScheduledEvent],
  })

client.commands = new Collection()

client.login(process.env.token).then(() => {
    loadEvents(client)
    loadCommands(client)
    err(client)
})