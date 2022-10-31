const { model, Schema } = require('mongoose')

module.exports = model("poll", new Schema({
    question: String,
    message: String,
    channel: String,
    guild: String,
    votes: Object,
    voters: {
        type: [String],
        default: []
    },
    emojis: [String],
    ended: {
        type: Boolean,
        default: false
    }
}))