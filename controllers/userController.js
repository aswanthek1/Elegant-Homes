const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const async = require('hbs/lib/async')
let Promise = require('promise')
const { reject, resolve } = require('promise')
const addressModel = require('../models/addressModel')
const { ObjectID } = require('bson')
const cartModel = require('../models/cartModel')
const orderModel = require('../models/orderModel')
const productModel = require('../models/addproductModel')
const coupenModel = require('../models/coupenModel')




module.exports = {
  userlogin: (logindata) => {

    return new Promise(async (resolve, reject) => {
      try {
        let response = {
          status: false,
          usernotfound: false

        }
        let user = await userModel.findOne({ email: logindata.email });
        if (user) {
          bcrypt.compare(logindata.password, user.password, (err, valid) => {
            if (valid) {
              response.status = true;
              response.user = user
              response.email = user.email
              resolve(response)
              console.log("success");
            } else {
              resolve(response);
              console.log("error found while bcrypting", err);
            }

          })
        } else {
          response.usernotfound = true
          resolve(response)

        }
      } catch (error) {
        reject(error)
      }

    })
  },

  usersignup: (userdata) => {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await userModel.findOne({ $or: [{ email: userdata.email }, { phonenumber: userdata.phonenumber }] });
        const state = {
          userexist: false,
          user: null
        }
        if (!user) {
          userdata.password = await bcrypt.hash(userdata.password, 10);
          console.log(userdata.password);
          userModel.create(userdata).then((data) => {
            console.log(data);
            state.userexist = false
            state.user = data
            state.email = userdata.email

            resolve(state)
          })
        } else {
          state.userexist = true
          resolve(state)
        }
      } catch (error) {
        reject(error)
      }

    })
  },

  ///////////////////////////////user profile////////////////////////////////////


  userProfile: (Userid) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("USERID   ", Userid);
        await userModel.findById({ _id: Userid }).lean().then((userData) => {
          console.log(userData);
          resolve(userData)
        })
      } catch (error) {
        reject(error)
      }
    })
  },

  addAddress: (addressData, userid) => {
    return new Promise(async (resolve, reject) => {
      try {
        address = new addressModel({
          address: {
            name: addressData.name,
            phonenumber: addressData.phonenumber,
            email: addressData.email,
            Address: addressData.Address,
            locality: addressData.locality,
            pincode: addressData.pincode,
            landmark: addressData.landmark,
            district: addressData.district
          },
          userId: userid
        })
        address.save().then((response) => {
          resolve(response)
        })
      } catch (error) {
        console.log("error  ", error);
        reject(error)
      }
    })
  },

  getAddress: (userid) => {
    return new Promise(async (resolve, reject) => {
      try {
        await addressModel.find({ userId: ObjectID(userid) }).lean().then((response) => {
          resolve(response)
        })

      } catch (error) {
        reject(error)

      }
    })
  },


  deleteAddress: (addressId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await addressModel.findByIdAndDelete({ _id: ObjectID(addressId) }).then((response) => {
          resolve(response)
        })
      } catch (error) {
        reject(error)
      }
    })
  },

  editProfile: (userData, userid) => {
    return new Promise(async (resolve, reject) => {
      try {
        await userModel.findByIdAndUpdate({ _id: ObjectID(userid) }, {
          name: userData.name,
          email: userData.email,
          phonenumber: userData.phonenumber,
          image: userData.image,
          address: userData.address
        }
        )
          .then((response) => {
            resolve(response)
          })
      } catch (error) {
        console.log(error, "       errror");
        reject(error)
      }
    })
  },


  editPassword: (userid, userContent) => {
    let response = {
      correctPassword: false
    }
    return new Promise(async (resolve, reject) => {
      try {

        let user = await userModel.findOne({_id:userid}).lean()
        let newPassword = await bcrypt.hash(userContent.newpassword, 10)
        let result = await bcrypt.compare(userContent.oldpassword, user.password) 
        if (result) {
          userModel.updateOne({ _id: userid }, {
            $set: {
              password: newPassword
            }
          })
            .then((response) => {
              response.correctPassword = true
              resolve(response)
            })
        } else {
          response.correctPassword = false
          resolve(response)
        }
      } catch (error) {
        console.log(error, "  errrrorrr");
        reject(error)
      }
    })


  },


  getItemToCheck: (UID) => {
    return new Promise(async (resolve, reject) => {
      try {
        let check = await cartModel.find({ userId: UID }).populate("cartItems.product").lean()
        resolve(check)

      } catch (error) {
        console.log("errrorr  ", error);
        reject(error)
      }
    })
  },


  getAddressToCheck: (data, userid) => {
    return new Promise(async (resolve, reject) => {
      try {
        await addressModel.find({ userId: ObjectID(userid) }).lean().then((response) => {
          resolve(response)
        })

      } catch (error) {
        reject(error)

      }
    })
  },


  getOrderToTrack: (orderid, userid) => {
    return new Promise(async (resolve, reject) => {
      try {
        await orderModel.findOne({ userId: userid, _id: orderid }).populate('deliveryDetails').lean().then((response) => {
          resolve(response)
        })
      } catch (error) {
        console.log("erroerrrrr", error);
        reject(error)
      }
    })
  },

  cancelOrder: (orderid) => {
    console.log("orderererid", orderid)
    return new Promise(async (resolve, reject) => {
      try {
        await orderModel.findByIdAndUpdate({ _id: orderid }, { productStatus: "Cancelled" }).then((response) => {
          resolve(response)
        })
      } catch (error) {
        reject(error)
      }
    })
  },

  editAddress: (data, addressid) => {
    return new Promise(async (resolve, reject) => {
      try {
        let newAddress = await addressModel.updateOne({ _id: addressid }, {
          $set: {
            address: {
              name: data.name,
              phonenumber: data.phonenumber,
              email: data.email,
              Address: data.Address,
              pincode: data.pincode,
              locality: data.locality,
              landmark: data.landmark,
              district: data.district
            }
          }
        }, { new: true }).then((response) => {
          resolve(response)
        })
      } catch (error) {
        console.log("error", error)
        reject(error)
      }
    })
  }


}
