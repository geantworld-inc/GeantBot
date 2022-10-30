const { model, Schema } = require("mongoose")

module.exports = model("levelup", new Schema({
    Guild: String,
    Channel: String,
}))