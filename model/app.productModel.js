const mongoose = require("mongoose")
const schema = mongoose.Schema

const productModel = new schema ({
    productName : {
        type : String,
        required : true
    },
    productPrice : {
        type : String,
        required : true
    },
    image : {
        type : String,
        required : true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    }
},
{
    timestamps : true,
    required : false
})

module.exports = new mongoose.model("Product" , productModel)