const { model, Schema } = require('mongoose')

module.exports = model("Warnings", new Schema({
    GuildId: String,
    UserId: String,
    UserTag: String,
    Content: Array
}))