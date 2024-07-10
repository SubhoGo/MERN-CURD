const mongoose = require("mongoose")
const schema = mongoose.Schema

const appModel = new schema ({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
},
{
    timestamps : true,
    required : false
})

module.exports = new mongoose.model("User" , appModel)