const mongoose = require('mongoose')


const addressSchema = new mongoose.Schema({

address:{
    name:"string",
    phonenumber:"number",
    email:"string",
    Address:"string",
    pincode:"number",
    locality:"string",
    landmark:"string",
    district:"string"
},
userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"users"
}

})

const addressModel = mongoose.model('address',addressSchema)
module.exports = addressModel