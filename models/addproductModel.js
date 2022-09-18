const mongoose = require('mongoose');

const addproductschema = new mongoose.Schema({
    productname:{
        type:String
    },
    price:{
        type:Number
    },
    discountprice:{
        type:Number
    },
    categoryname:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'categories'
    },
    stock:{
        type:Number
    },
    
    description:{
        type:String
    },
    image:{
        type:Array
        
    }
},{timestamps:true})


const productModel = mongoose.model('products',addproductschema)


module.exports=productModel