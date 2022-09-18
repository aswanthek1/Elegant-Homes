const mongoose = require('mongoose');


const bannerSchema = new mongoose.Schema({
  product:{
    type:mongoose.Schema.Types.String,
    ref:"products"
  },
  heading:String,
  description:String,
  price:Number,
  image:Array

},{timestamps:true})

const bannerModel  = mongoose.model('banners',bannerSchema)

module.exports = bannerModel;