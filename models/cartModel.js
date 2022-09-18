const mongoose = require('mongoose');
const Schema = mongoose.Schema


const cartSchema = new mongoose.Schema({
userId:{
    type:Schema.Types.ObjectId,
    ref:"users"
},

cartItems:[{
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"products"
    },
    quantity:'number'
}]

  
    

  
},{timestamps:true})


const cartModel = mongoose.model('cartItems',cartSchema)


module.exports=cartModel