const { model, Schema } = require('mongoose')

module.exports = model("suggestChannel", new Schema({

    Channel: String,
    Guild: String


}))