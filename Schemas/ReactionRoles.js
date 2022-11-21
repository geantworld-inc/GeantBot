const { model, Schema } = require('mongoose')

module.exports = model("reactionRoles", new Schema({
    GuildID: String,
    roles: Array
}))