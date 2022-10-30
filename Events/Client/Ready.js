const { Client } = require("discord.js")
const ms = require("ms")
const mongoose = require("mongoose")
const mongodbURL = process.env.MongoDBURL

module.exports = {
    name: "ready",
    /**
     * @param {Client} client
     */
    async execute (client) {
        const { user, ws } = client

        console.log(`${user.tag} is now online`)

        setInterval(() => {
            const ping = ws.ping

            user.setActivity({
                name: `My ping: ${ping} ms`,
                type: 3
            })
        }, ms("5s"));

        if (!mongodbURL) return console.log("No MongoDB url found!")

        mongoose.connect(mongodbURL, {

            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log("Connected to the database")
        }).catch(err => console.log(err))
    }
}