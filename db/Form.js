const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema({
    name: String,
    description: String,
    headerImage: String,
    questions: Array,
})

module.exports = mongoose.model("Form", FormSchema);