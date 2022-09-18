const mongoose = require('mongoose');

const coupenSchema = new mongoose.Schema({


    userId: [{
        type:mongoose.Schema.Types.ObjectId,
        ref : 'users'
    }],
    coupenName : String,
    coupenCode : String,
    coupenDiscount : String
},{timestamps:true})

const coupenModel = mongoose.model('coupens',coupenSchema)

module.exports = coupenModel