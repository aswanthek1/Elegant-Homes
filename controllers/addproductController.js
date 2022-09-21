const { ObjectID } = require('bson')
const { response } = require('express')
const async = require('hbs/lib/async')
const { resolve, reject } = require('promise')
const productModel = require('../models/addproductModel')
const categoryModel = require('../models/categoryModel')
const bannerModel = require('../models/bannerModel')
const { promise } = require('bcrypt/promises')
const cartModel = require('../models/cartModel')
const wishlistModel = require('../models/wishlistModel')
const orderModel = require('../models/orderModel')
const userController = require('../controllers/userController')
const addressModel = require('../models/addressModel')
const coupenModel = require('../models/coupenModel')
const { MongoUnexpectedServerResponseError } = require('mongodb')
const Razorpay = require('razorpay');
const fs = require('fs');
const dotenv = require('dotenv')
dotenv.config({ path: "./config.env" })

var instance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret
});

Helpers = {

  getallCategory: (categoryData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let allCategory = await categoryModel.find({}).lean()
        resolve(allCategory)

      } catch (error) {
        reject(error)
      }
    })
  },

  getallproducts: () => {
    return new Promise((resolve, reject) => {
      try {
        productModel.find({}).populate("categoryname").sort({ createdAt: -1 }).lean().then((products) => {
          resolve(products)
        })
      } catch (error) {
        reject(error)
      }

    })
  },


  AddProduct: (productData) => {
    return new Promise((resolve, reject) => {
      try {
        products = new productModel({
          productname: productData.productname,
          price: productData.price,
          discountprice: productData.discountprice,
          categoryname: productData.catname,
          image: productData.image,
          stock: productData.stock,
          description: productData.description
        })
        products.save().then((data) => {
          resolve(data)
        })
      } catch (error) {
        reject(error)
      }

    })
  },

  deleteProduct: (productID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await productModel.findByIdAndDelete({ _id: ObjectID(productID) }).then((response) => {
          resolve(response)
        })
      } catch (error) {
        reject(error)
      }

    })
  },

  getProductdetails: (productID) => {
    return new Promise(async (resolve, reject) => {
      try {
        let productContent = await productModel.findOne({ _id: ObjectID(productID) }).lean()
        resolve(productContent)
      } catch (error) {
        reject(error)
      }

    })
  },



  updateProduct: (productID, productDetails) => {
    return new Promise(async (resolve, reject) => {
      try {
        productModel.findByIdAndUpdate(productID, {

          productname: productDetails.productname,
          price: productDetails.price,
          discountprice: productDetails.discountprice,
          categoryname: productDetails.catname,
          stock: productDetails.stock,
          description: productDetails.description,
          image: productDetails.image

        }).then((response) => {

          resolve(response)
        })
      } catch (error) {
        reject(error)
      }

    })
  },

  getProductToList: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let productList = await productModel.find({}).lean()
        resolve(productList)
      } catch (error) {
        reject(error)
      }

    })
  },


  ///////////////////////////banner management///////////////////////////


  getAllBanners: () => {
    return new Promise(async (resolve, reject) => {
      try {
        bannerModel.find({}).lean().then((bannerResponse) => {
          resolve(bannerResponse)
        })
      } catch (error) {
        reject(error)
      }

    })
  },

  productList: () => {
    return new Promise(async (resolve, reject) => {
      try {
        productModel.find({}).lean().then((prodList) => {
          resolve(prodList)
        })
      } catch (error) {
        reject(error)
      }

    })
  },

  AddBanner: (bannerData) => {
    return new Promise(async (resolve, reject) => {
      try {
        banners = await bannerModel({
          product: bannerData.prodname,
          heading: bannerData.heading,
          description: bannerData.description,
          image: bannerData.image

        }).save().then((banners) => {
          resolve(banners)
        })
      } catch (error) {
        reject(error)
      }

    })
  },

  //////////////////////////delete banners//////////////////////////


  deleteBanner: (bannerID) => {
    return new Promise(async (resolve, reject) => {
      try {
        await bannerModel.findByIdAndDelete({ _id: ObjectID(bannerID) }).then((response) => {
          resolve(response)
        })
      } catch (error) {
        reject(error)
      }

    })
  },

  ////////////////////////////edit banners////////////////////////////////

  getBanner: (bannerID) => {
    return new Promise(async (resolve, reject) => {
      try {
        let bannerDetails = await bannerModel.findOne({ _id: ObjectID(bannerID) }).lean()
        resolve(bannerDetails)
      } catch (error) {
        reject(error)
      }

    })
  },




  editBanner: (bannerID, bannerContent) => {
    return new Promise(async (resolve, reject) => {
      try {
        await bannerModel.findByIdAndUpdate(bannerID, {
          $set: {
            product: bannerContent.prodname,
            heading: bannerContent.heading,
            price: bannerContent.price,
            image: bannerContent.image
          }

        }, { new: true })
          .then((response) => {
            console.log(response)
            resolve(response)
          }).catch((error) => {
            console.log("error found at updating" + error);
          })
      } catch (error) {
        reject(error)
      }

    })
  },

  ///////////////////////////////add to cart///////////////////////////


  getItem: (userid) => {

    return new Promise(async (resolve, reject) => {
      try {
        const response = {};
        let cart = await cartModel.findOne({ userId: userid }).populate('cartItems.product').lean()

        if (cart) {
          if (cart.cartItems.length > 0) {
            response.cartempty = false
            response.cart = cart
            resolve(response)
          } else {
            response.cartempty = true
            response.cart = cart
            resolve(response)
          }
        } else {
          response.cartempty = true
          resolve(response)
        }
      } catch (error) {
        reject(error)
      }


    })
  },


  addToCart: (prodId, userid) => {

    const response = {
      duplicate: false
    }

    return new Promise(async (resolve, reject) => {
      try {

        let checkCart = await cartModel.findOne({ userId: userid })

        if (checkCart) {

          let cartProduct = await cartModel.findOne({ userId: userid, 'cartItems.product': ObjectID(prodId) })
          if (cartProduct) {

            cartModel.updateOne({ userId: userid, "cartItems.product": prodId }, { $inc: { 'cartItems.$.quantity': 1 } })

              .then((response) => {
                console.log(response, 'fdsff')
                // response.inc = true
                response.duplicate = true
                resolve(response)
              })

          } else {

            let cartArray = { product: prodId, quantity: 1 }
            cartModel.findOneAndUpdate({ userId: userid },
              {
                $push: { cartItems: cartArray }
              }).then((data) => {
                resolve(response)
              })
          }
        } else {

          let quantity = 1;
          let cart = new cartModel({
            userId: userid,
            cartItems: [{
              product: prodId,
              quantity
            }]
          })
          cart.save().then((data) => {
            resolve(response)
          })
        }
      } catch (error) {
        console.log("errrrorr", error);
        reject(error)
      }
    })
  },


  /////////////////////////////showing number  of items in badge////////////////////


  getCartCount: (userid) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0
        let cart = await cartModel.findOne({ userId: userid })
        if (cart) {
          count = cart.cartItems.length
        }
        resolve(count)
      } catch (error) {
        reject(error)
      }

    })
  },



  incrementQty: (prodid, userid) => {
    return new Promise(async (resolve, reject) => {

      try {
        cartModel.updateOne({ userId: userid, "cartItems.product": prodid }, { $inc: { "cartItems.$.quantity": 1 } }).then(async (response) => {
          let cart = await cartModel.findOne({ userId: userid })

          console.log(cart)
          let quantity
          for (let i = 0; i < cart.cartItems.length; i++) {
            if (cart.cartItems[i].product == prodid) {
              quantity = cart.cartItems[i].quantity
            }
          }
          response.quantity = quantity
          resolve(response)
        })
      } catch (error) {
        reject(error)
      }



    })
  },

  decrimentQty: (prodid, userid) => {
    return new Promise(async (resolve, reject) => {

      try {
        let decValue = cartModel.updateOne({ userId: userid, "cartItems.product": prodid }, { $inc: { "cartItems.$.quantity": -1 } }).then(async (response) => {

          let cart = await cartModel.findOne({ userId: userid })

          let quantity
          for (let i = 0; i < cart.cartItems.length; i++) {
            if (cart.cartItems[i].product == prodid) {
              quantity = cart.cartItems[i].quantity
            }
          }
          response.quantity = quantity
          resolve(response)
        })
      } catch (error) {
        reject(error)
      }

    })
  },




  deleteCart: (productID, userID) => {
    return new Promise(async (resolve, reject) => {
      try {

        let dltCart = await cartModel.updateOne({ userId: ObjectID(userID) }, {
          $pull: { cartItems: { product: ObjectID(productID) } }
        }).then((response) => {
          resolve(response)
        })
      } catch (error) {
        reject(error, "errrrrorrr")
      }
    })
  },



  getTotalAmount: (userid) => {
    return new Promise(async (resolve, reject) => {
      try {


        Helpers.getItem(userid).then((res) => {

          let response = {}
          cart = res.cart
          let total;
          if (cart) {
            let cartLength = cart.cartItems.length
            console.log(cartLength);
            if (cartLength >= 0) {
              total = cart.cartItems.reduce((acc, curr) => {
                acc += curr.product.price * curr.quantity
                return acc
              }, 0)

              response.cart = cart
              console.log(total);
              response.totalAmount = total;
              resolve(response)
            }

          } else {
            console.log("hey its error");
            response.cartempty = true
            resolve(response)
          }

        })
      } catch (error) {
        console.log("error found" + error);
        reject(error)
      }

    })
  },


  singleProduct: (itemId) => {
    return new Promise((resolve, reject) => {
      try {
        productModel.findOne({ _id: itemId }).lean().then((singleproduct) => {
          resolve(singleproduct)
        })
      } catch (error) {
        reject(error, "errrorrrrr")
      }
    })
  },





  getWishItem: (userid) => {
    return new Promise(async (resolve, reject) => {
      let response = {}
      try {
        let wishlist = await wishlistModel.findOne({ userId: userid }).populate('wishlistItems.product').populate('wishlistItems.category').lean()

        if (wishlist) {
          if (wishlist.wishlistItems.length > 0) {
            response.wishlistEmpty = false
            response.wishlist = wishlist
            resolve(response)
          } else {
            response.wishlistEmpty = true
            console.log("kdkdkd")
            response.wishlist = wishlist
            console.log(response)
            resolve(response)
          }
        }
        else {
          response.wishlistEmpty = true
          resolve(response)
        }


      } catch (error) {
        reject(error, "errrorrrrrrr")
      }

    })
  },


  addToWishlist: (prodID, userID) => {
    let response = {
      duplicate: false
    }

    return new Promise(async (resolve, reject) => {
      try {
        let checkWishlist = await wishlistModel.findOne({ userId: ObjectID(userID) })
        console.log(checkWishlist);
        if (checkWishlist) {

          let checkItem = await wishlistModel.findOne({ userId: ObjectID(userID), 'wishlistItems.product': prodID })

          if (checkItem) {
            response.duplicate = true
            // duplicate = response.duplicate
            resolve(checkItem)
          } else {

            let wishlistArray = { product: ObjectID(prodID) }
            await wishlistModel.updateOne({ userId: ObjectID(userID) },
              {
                $push: { wishlistItems: wishlistArray }
              }).then((response) => {

                resolve(response)
              })
          }
        } else {

          let whishlistObj = new wishlistModel({
            userId: ObjectID(userID),
            wishlistItems: [{
              product: ObjectID(prodID),
            }]
          })

          whishlistObj.save().then((data) => {
            resolve(response)
          }).catch((err) => {
            console.log("error   ", err);
          })
        }

      } catch (error) {
        console.log("errror", error);
        resolve(error)
      }

    })
  },

  deleteWishItem: (prodID, userID) => {
    return new Promise(async (resolve, reject) => {
      try {
        let wishItem = await wishlistModel.updateOne({ userId: ObjectID(userID) }, { $pull: { wishlistItems: { product: ObjectID(prodID) } } })
        resolve(wishItem)
      } catch (error) {
        console.log("errrror", error);
        resolve(response)
      }
    })

  },


  placeOrder: (checkoutData, userID, grandTotal, coupenDiscount) => {
    // console.log(grandTotal, "  checkoutdata       ", checkoutData)
    return new Promise(async (resolve, reject) => {
      try {
        if (checkoutData.paymentDetails === "COD") {
          OrderStatus = true
        }

        Helpers.getTotalAmount(userID).then(async (response) => {
          let cartprod = response.cart.cartItems
          if (checkoutData.discountprice) {
            response.totalAmount = response.totalAmount - checkoutData.discountprice

          }
          var date = new Date()
          var newdate = date.toISOString()
          newdate = newdate.slice(0, 10)

          let newOrder = new orderModel({
            userId: userID,
            Orderitems: response.cart.cartItems,
            totalPrice: response.totalAmount,
            // deliveryCharge: checkoutData.shipping,    
            paymentDetails: checkoutData.paymentDetails,
            deliveryStatus: 'Pending',
            deliveryDetails: checkoutData.deliveryDetails,
            coupenDiscount: coupenDiscount,
            grandTotal: grandTotal,
            OrderStatus: true,
            productStatus: "Pending",
            newdate: newdate

          })
          newOrder.save()
          let removed = await cartModel.deleteOne({ userId: userID })
          resolve(newOrder)

        })



      } catch (error) {
        reject(error, "         errrrorrr")
      }

    })

  },


  myOrders: (userid) => {
    return new Promise(async (resolve, reject) => {
      try {
        await orderModel.find({ userId: userid }).populate('Orderitems.product').populate('deliveryDetails').sort({ createdAt: -1 }).lean().then((response) => {
          resolve(response)
        })
      } catch (error) {
        reject(error)
      }
    })
  },



  getOrderCount: (userid) => {
    return new Promise(async (resolve, reject) => {
      try {
        let Ordercount = 0
        let cart = await orderModel.findOne({ userId: userid })
        if (cart) {
          Ordercount = cart.Orderitems.length
        }
        console.log(Ordercount);
        resolve(Ordercount)
      } catch (error) {
        reject(error)

      }
    })
  },

  applyCoupen: (userID, coupenData) => {
    console.log(coupenData.code);
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        response.discount = 0
        let coupen = await coupenModel.findOne({ coupenCode: coupenData.code })
        if (coupen) {
          response.coupen = coupen
          let coupenuser = await coupenModel.findOne({
            coupenCode: coupenData.code,
            userId: { $in: [userID] },

          })
          if (coupenuser) {
            response.status = false
            resolve(response)
          } else {
            response.status = true
            response.coupen = response
            Helpers.getItem(userID).then((cartProd) => {
              cart = cartProd.cart

              let grandTotal
              if (cart) {
                let cartlength = cart.cartItems.length
                console.log("length  ", cartlength)
                if (cartlength >= 0) {
                  grandTotal = cart.cartItems.reduce((acc, curr) => {
                    acc += curr.product.price * curr.quantity
                    return acc
                  }, 0)

                  response.discount =
                    (grandTotal * coupen.coupenDiscount) / 100
                  grandTotal = grandTotal - response.discount;
                  console.log("discount price", grandTotal);

                  response.grandTotal = grandTotal
                  response.coupen = coupen

                  resolve(response)

                } else {
                  resolve(response)

                }
              } else {
                resolve(response)
              }
            })
          }
        } else {
          response.status = false

          console.log("afterrrerr", response);
          resolve(response)
        }

      } catch (error) {
        console.log("errrrorror   ", error)
        reject(error)
      }
    })
  },



  coupenUser: (userid, coupen) => {
    return new Promise(async (resolve, reject) => {
      try {
        await coupenModel.findByIdAndUpdate(coupen._id, { $push: { userId: userid } }).then((response) => {
          resolve(response)
        })
      } catch (error) {
        console.log("errrirrrorrr", error);
        reject(error)
      }
    })
  },

  trackCoupen: (userid, coupenid) => {
    return new Promise(async (resolve, reject) => {
      try {
        await coupenModel.findOne({ _id: coupenid, userId: { $in: [userid] } }).lean().then((response) => {
          resolve(response)
        })

      } catch (error) {
        console.log("sorry check again  ", error)
        reject(error)
      }
    })
  },

  getTrack: (orderid) => {
    return new Promise(async (resolve, reject) => {
      try {
        await orderModel.findOne({ _id: orderid }).populate('Orderitems.product').populate('deliveryDetails').populate('userId').lean().then((response) => {
          resolve(response)
        })
      } catch (error) {
        console.log("found error ", error)
        reject(error)
      }
    })
  },


  categoryProducts: (categoryid) => {
    return new Promise(async (resolve, reject) => {
      try {
        await productModel.find({ categoryname: categoryid }).populate('categoryname').lean().then((response) => {
          resolve(response)
        })
      } catch (error) {
        reject(error)
      }
    })
  },

  generateRazorpay: (orderid, grandTotal) => {
    let Total = parseInt(grandTotal)
    console.log("totsal  ", Total)
    return new Promise(async (resolve, reject) => {
      try {
        var options = {
          amount: Total * 100, // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + orderid,
        };
        instance.orders.create(options, function (err, order) {
          console.log("orderr", order)
          resolve(order);
        });
      } catch (error) {

      }
    })
  },

  verifyPayment: (details) => {
    return new Promise(async (resolve, reject) => {
      try {
        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256', process.env.key_secret)
        let body = details.payment.razorpay_order_id + "|" + details.payment.razorpay_payment_id;
        hmac.update(body.toString());
        hmac = hmac.digest('hex')
        if (hmac == details.payment.razorpay_signature) {
          resolve()
        } else {
          reject()
        }
      } catch (error) {
        reject(error)
      }
    })
  },

  changePaymentStatus: (orderid) => {
    return new Promise(async (resolve, reject) => {
      try {
        await orderModel.findOneAndUpdate({ _id: orderid }, { OrderStatus: true, deliveryStatus: "success" }).then((response) => {
          resolve(response)
        })
      } catch (error) {
        reject(error)
      }
    })
  }






















}

module.exports = Helpers


