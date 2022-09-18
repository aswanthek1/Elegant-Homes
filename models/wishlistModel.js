const { Timestamp } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema


const wishlistSchema = new mongoose.Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },

    wishlistItems: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: "products"
        },
        category:{
            type: Schema.Types.ObjectId,
            ref:'categories'
        }
    }]
}, { timestamps: true })

const wishlistModel = mongoose.model('whishlist', wishlistSchema)

module.exports = wishlistModel
