const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    Orderitems: [{

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products'
        },
        quantity: {
            type: Number
        }
    }],

    totalPrice: Number,
    deliveryCharge: Number,
    deliveryDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'address'
    },
    paymentDetails: String,
    OrderStatus: Boolean,
    deliveryStatus: String,
    productStatus:String,
    grandTotal:String,
    coupenDiscount:Number,
    online:String,
    newdate:String

}, { timestamps: true })

const orderModel = mongoose.model('orders', orderSchema)
module.exports = orderModel