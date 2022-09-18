const async = require('hbs/lib/async');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
//  var uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
         type:String,
         unique:true,
    },
    phonenumber:{
        type:Number,     
    },
    password:{
         type:String,
         
     },
     status:{
        type:Boolean
     },
     address:{
        type:String
     },
     locality:{
        type:String
     },
     district:{
        type:String
     }

},{timestamps:true})


// userSchema.pre('save',async function(next){
// try{
//     const hash = await bcrypt.hash(this.password,10)
//     this.password = hash
//     next()
// }catch(err){
//     next(err)
// }
// })

const userModel = mongoose.model('users',userSchema)


module.exports=userModel
