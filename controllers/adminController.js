const adminModel = require('../models/adminModel')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')
const { reject, resolve } = require('promise')
const userModel = require('../models/userModel')
const objectid = require('mongodb').ObjectId
const orderModel = require('../models/orderModel')
const coupenModel = require('../models/coupenModel')



module.exports = {

    adminlogin: (admindata) => {
        console.log(admindata);
        return new Promise(async (resolve, reject) => {
            try {
                let response = {
                    status: false,
                    adminnotfound: false
                }
    
                let admin = await adminModel.findOne({ email: admindata.email });
                if (admin) {
                    bcrypt.compare(admindata.password, admin.password, (err, valid) => {
                        if (valid) {
                            response.status = true;
                            response.admin = admin
                            resolve(response)
                            console.log("admin success");
                        } else {
    
                            resolve(response)
                            console.log("error found", err)
                        }
                    })
                } else {
                    response.adminnotfound = true
                    resolve(response);
                    console.log("admin datas incorrect")
                } 
            } catch (error) {
                reject(error)
            }
    
        })
    },

    getUserData: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let users = await userModel.find({}).lean()
                resolve(users)  
            } catch (error) {
                reject(error)
            }
           
        })
    },

    block_User: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await userModel.findById({ _id: objectid(id) })
                user.status = true
                await userModel.updateOne({ _id: objectid(id) }, user)
                resolve('I got it')  
            } catch (error) {
                reject(error)
            }
       
        })
    },

    activate_User: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await userModel.findById({ _id: objectid(id) })
                user.status = false
                await userModel.updateOne({ _id: objectid(id) }, user)
                resolve('I got it again')  
            } catch (error) {
                reject(error)
            }
           
        })
    },

    getOrderDetails : () => {
        return new Promise(async(resolve,reject) => {
            try {
                await orderModel.find().populate('userId').populate('Orderitems.product').populate('deliveryDetails').sort({createdAt:-1}).lean().then((response) => {
                    resolve(response)
                })
            } catch (error) {
                console.log("errrerreoer",error);
                reject(error)
            }
        })
    },

    getCoupens : (coupenData) => {
        return new Promise(async(resolve,rejecet) => {
            try {
                await coupenModel.find().lean().then((response) => {
                    resolve(response)
                })
            } catch (error) {
                console.log("errerrorr",error)
                reject(error)
            }
        })
    },

    addCoupens : (coupenData) =>{
        return new Promise(async(resolve,reject) => {
            coupenData.coupenCode = coupenData.coupenCode. toUpperCase()
            let response ={}
            try {

                let code = await coupenModel.findOne({coupenCode:coupenData.coupenCode})
            if(code){
                response.coupenExist = true
                resolve(response)
            }else{
                coupens = await coupenModel({
                    coupenName : coupenData.coupenName,
                    coupenCode : coupenData.coupenCode,
                    coupenDiscount : coupenData.coupenDiscount
                })
                coupens.save().then((response) => {
                    response.coupenExist = false
                    resolve(response)
                })
            }
            } catch (error) {
                console.log("coupems errrr  ",error)
                reject(error)
            }
        })
    },

    deleteCoupen : (coupenid) => {
        return new Promise(async(resolve,reject)=>{
            try {
                await coupenModel.findByIdAndDelete({_id:coupenid}).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    editCoupen : (coupenid,coupenData) =>{
        coupenData.coupenCode = coupenData.coupenCode. toUpperCase()
        return new Promise(async(resolve,reject) => {
            try {
                await coupenModel.findByIdAndUpdate({_id:coupenid},{
                    coupenName:coupenData.coupenName,
                    coupenCode:coupenData.coupenCode,
                    coupenDiscount:coupenData.coupenDiscount
                }).then((response)=>{
                    
                    resolve(response)
                })
            } catch (error) {
                console.log("errroerr",error)
                reject(error)
            }
        })
    },

    coupenForEdit : (coupenid) => {
        return new Promise(async(resolve,reject) => {
            try {
        let forCoupenEdit =  await coupenModel.findOne({_id:coupenid}).lean()
                    resolve(forCoupenEdit)
               
            } catch (error) {
                reject(error)
            }
        })
    },

    shipProduct : (orderid) => {
        return new Promise(async(resolve,reject) => {
            try {
                await orderModel.findByIdAndUpdate({_id:orderid},{productStatus:"shipped"}).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    deliverProduct : (orderid) => {
        return new Promise(async(resolve,reject) => {
            try {
                await orderModel.findByIdAndUpdate({_id:orderid},{productStatus:"deliverd"}).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    cancelOrder : (orderid) => {
        return new Promise(async(resolve,reject) =>{
            try {
                await orderModel.findByIdAndUpdate({_id:orderid},{productStatus:"Cancelled"}).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })
    },

    getWholeOrders : () => {
        return new Promise(async(resolve,reject)=>{
            try {
               let wholeOrders = await orderModel.find().lean()               
               let orderLength = wholeOrders.length              
               resolve(orderLength)
            } catch (error) {
                console.log("errror",error)
                reject(error)
            }
        })
    },

    getWholeUsers : () =>{
        return new Promise(async(resolve,reject)=>{
            try {
                let wholeUsers = await userModel.find().lean()
                let userLength = wholeUsers.length               
                resolve(userLength)
            } catch (error) {
                
            }
        })
    },

    getTotalIncome : () => {
        return new Promise(async(resolve,reject)=>{
            try {    
               let wholeIncome = await orderModel.find().lean()               
               let totalIncome = wholeIncome.map(function(income){return income.totalPrice});           
               let total = totalIncome.reduce((acc,curr) => acc+parseInt(curr),0)     
               resolve(total)                
            } catch (error) {
                console.log("errror",error)
                reject(error)
            }
        })
    },
    getPendingOrders : () => {
        return new Promise(async(resolve,reject)=>{
            try {
                let pendingOrders = await orderModel.find().lean()
                let totalPending = pendingOrders .map(function(pending){return pending.productStatus})
                let pendingCount = 0
               for(let i=0;i<totalPending.length;i++){
                    if(totalPending[i]==="Pending"){
                        pendingCount= pendingCount+1   
                    }                   
                } 
                resolve(pendingCount)                 
            } catch (error) {
                console.log(error)
                reject(error)
            }
        })
    },

    getCancelledOrders : () =>{
        return new Promise(async(resolve,reject)=>{
            try {
                let cancelledOrders = await orderModel.find().lean()
                let totalCancell = cancelledOrders.map(function(cancell){return cancell.productStatus})
                let cancellCount = 0
               for(let i=0;i<totalCancell.length;i++){
                    if(totalCancell[i]==="Cancelled"){
                        cancellCount= cancellCount+1   
                    }                   
                } 
                resolve(cancellCount)                 
            } catch (error) {
                console.log(error)
                reject(error)
            }
        })
    },

    getDeliverdOrders : () =>{
        return new Promise(async(resolve,reject)=>{
        try {
            let deliverdOrders = await orderModel.find().lean()
            let totalDeliver = deliverdOrders.map(function(deliver){return deliver.productStatus})
            let deliverCount = 0
           for(let i=0;i<totalDeliver.length;i++){
                if(totalDeliver[i]==="deliverd"){
                    deliverCount= deliverCount+1   
                }                   
            }
            resolve(deliverCount)                 
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
},

getShippedOrders : () =>{
    return new Promise(async(resolve,reject)=>{
    try {
        let shippedOrders = await orderModel.find().lean()
        let totalShipped = shippedOrders.map(function(Shipped){return Shipped.productStatus})
        let ShippedCount = 0
       for(let i=0;i<totalShipped.length;i++){
            if(totalShipped[i]==="shipped"){
                ShippedCount= ShippedCount+1   
            }                   
        }
        resolve(ShippedCount)                 
    } catch (error) {
        console.log(error)
        reject(error)
    }
})
},

stati : () =>{
    return new Promise(async(resolve,reject) => {
        try {

           var dateArray = []
           for(let i=0;i<5;i++){
              var d = new Date();
              d.setDate(d.getDate() -i)
              var newdate = d.toISOString()
              newdate = newdate.slice(0,10) 
              dateArray[i]=newdate
           }
            var dateSale = []
            for(let i=0;i<5;i++){
            dateSale[i] = await orderModel.find({newdate:dateArray[i]}).lean().count()
            }
            var status ={
                dateSale:dateSale,
                dateArray:dateArray 
            }
            resolve(status)

        } catch (error) {
            console.log("errrror",error)
        }
    })
}

}
