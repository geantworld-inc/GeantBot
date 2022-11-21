const { model, Schema } = require('mongoose')

module.exports = model("welcome", new Schema({
    Guild: String,
    Channel: String,
    Messages: String,
    DM: Boolean,
    DMMessage: Object,
    Content: Boolean,
    Embed: Boolean
}))