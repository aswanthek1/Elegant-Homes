const mongoose = require('mongoose');


const adminSchema = new mongoose.Schema({

email:{
    type:String,
    unique:true
},
password:{
    type:String
}

},{timestamps:true})

const adminModel = mongoose.model('admins',adminSchema)

module.exports = adminModel;