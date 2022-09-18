const mongoose = require('mongoose');


const subcategorySchema = new mongoose.Schema({
    subcategoryname:{
        type:String,
        
    },
    categoryname:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'categories'
    }
},{timestamps:true})

const subcategoryModel  = mongoose.model('subCategory',subcategorySchema)

module.exports = subcategoryModel;