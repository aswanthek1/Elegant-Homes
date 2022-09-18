var express = require('express');
var router = express.Router();
const userauthentication = require('../Authentication/userauthenticaton')
const Promise = require('promise');
const { response } = require('express');
const UserModel = require('../models/userModel')
const userController = require('../controllers/userController');
const session = require('express-session');
const twilioController = require('../controllers/twilioController')
const usermiddleware = require('../middleware/usermiddleware')
const productController = require('../controllers/addproductController');
const async = require('hbs/lib/async');
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const moment = require('moment');
const cartModel = require('../models/cartModel');



let verifylogin = (req, res, next) => {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

/* GET Landing page. */

router.get('/', usermiddleware.isblocked, async (req, res) => {                     ///////////////////////usermiddleware.isblocked,

  let cartCount = null;
  if (req.session.user) {
    cartCount = await productController.getCartCount(req.session.user._id)
  }
  if (req.session.loggedIn) {
    let user = req.session.user
    productController.getProductToList().then((productList) => {
      req.session.products = productList
      productController.getAllBanners().then((bannerResponse) => {
        categoryController.getcategory().then((category) => {
          // console.log(category, "lalalalalalalal")
          console.log(user)
          res.render('users/landingPage', { user, user_header: true, productList, bannerResponse, cartCount, category })
        })
      })
    })

  } else {
    categoryController.getcategory().then((category) => {
      productController.getProductToList().then((productList) => {
        productController.getAllBanners().then((bannerResponse) => {
          res.render('users/landingPage', { productList, user_header: true, bannerResponse, category })
        })
      })
    })
  }
})



////////////////////////////login//////////////////////////////

router.get('/login', (req, res) => {
  if (req.session.user) {
    res.redirect('/')
  } else {

    let user = req.session.usernotfound
    let wrongpassword = req.session.wrongpassword
    res.render('users/loginUsers', { user, wrongpassword })
  }
})


//////////////////////////user login post method//////////////////////////////


router.post('/login', (req, res, next) => {
  userController.userlogin(req.body).then((response) => {
    if (response.status) {
      req.session.user = response.user
      req.session.email = response.email
      req.session.loggedIn = true          ////////////////////////last added for middleware
      console.log("login success");
      res.redirect('/')
    }
    else if (response.usernotfound) {
      req.session.usernotfound = true
      req.session.wrongpassword = false
      console.log("user not found");
      res.redirect('/login')
    }
    else {
      console.log("login failed");
      req.session.usernotfound = false
      req.session.wrongpassword = true
      res.redirect('/login')
    }
  })
});

////////////////////////////////signup//////////////////////////////////

router.get('/signup', (req, res) => {
  
  if (req.session.user) {
    res.redirect('/')
  } else {

   userAlreadyExist = req.session.userAlreadyExist
    res.render('users/signupUsers',{userAlreadyExist})
  }
})

// router.get('/signup', (req, res) => {
//   session = req.session
  
//   res.render('users/signupUsers', { session })
// })



router.post('/signup', (req, res) => {
  userController.usersignup(req.body).then((state) => {
    if (state.userexist) {
      req.session.userAlreadyExist = true;
      userexist = state.userexist
      res.redirect('/signup')
    } else {
      req.session.user = state.user;
      req.session.email = state.email
      req.session.loggedIn = true
      console.log("user");
      res.redirect('/')
    }
  })
})

////////////////////////////otp///////////////////////

router.get('/otp', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/')
  } else {
    res.render('users/otpverify')
  }
})

////////////////////////////post method from login page to otp page///////

router.post('/otppage', (req, res) => {
  req.session.phonenumber = req.body.phonenumber
  twilioController.getOtp(req.body.phonenumber).then((response) => {

    if (response.exist) {
      if (response.ActiveStatus) {
        req.session.user = response.user
        // console.log(response.email);
        req.session.email = response.email
        res.redirect('/otp')
      } else {
        req.session.userBlocked = true
        res.redirect('/login')
      }
    } else {
      req.session.usernotfound = true
      res.redirect('/login')
    }
  })

})



///////////////////////////otp veryfiying//////////////////////////////////

router.post('/otpverify', (req, res) => {
  console.log(req.session.phonenumber);
  twilioController.checkOtp(req.body.otp, req.session.phonenumber).then((response) => {
    console.log(response);
    if (response == 'approved') {      
      req.session.loggedIn = true
      res.redirect('/')
    } else {
      res.redirect('/otp')
    }
  })

})

/////////////////////add to cart//////////////////////////////////

router.get('/addToCart', verifylogin,usermiddleware.isblocked, async (req, res, next) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await productController.getCartCount(req.session.user._id)
  }
  productController.getItem(req.session.user._id).then(async (cartItems) => {
    cart = response.cart
    let totalAmount
    cartempty = cartItems.cartempty
    productController.getTotalAmount(req.session.user._id).then((response) => {
      totalAmount = response.totalAmount;
      res.render('users/users-cart', { cartItems, totalAmount, cartCount,cartempty })
    })
  }).catch((err) => {
    next(err)
  })

})


router.post('/addToCart/:id', verifylogin, (req, res, next) => {
  let cartID = req.params.id
  productController.addToCart(cartID, req.session.user._id).then((response) => {
    if (response.cartempty) {
      req.session.cartempty = true
      req.session.cart = response.cart
      res.json(response)
    } else {
      req.session.cart = response.cart
      res.json(response)
    }

  }).catch((err) => {
    next(err)
  })
})


///////////////////////////qty inc and dec///////////////////////////////////////

router.post('/incQty/:id', (req, res) => {
  let incID = req.params.id
  productController.incrementQty(incID, req.session.user._id).then((response) => {
    res.json({ response })
  })

})


router.post('/decQty/:id', (req, res) => {
  let decID = req.params.id
  productController.decrimentQty(decID, req.session.user._id).then((response) => {
    res.json({ response })
  })

})

///////////////////////delete cart///////////////////////////
router.get('/delete-cart/:id', (req, res) => {
  let productID = req.params.id
  let userID = req.session.user._id
  console.log(productID + "       productid");
  productController.deleteCart(productID, userID).then((data) => {
    res.redirect('/addToCart')
    // res.json(data)
  })

})




/////////////////////////////////////single product////////////////////////

router.get('/singleProduct/:id', verifylogin,usermiddleware.isblocked, async (req, res) => {
  let itemId = req.params.id
  let cartCount = null;
  if (req.session.user) {
    cartCount = await productController.getCartCount(req.session.user._id)
  }
  productController.singleProduct(itemId).then((singleproduct) => {
    let user = req.session.user
    res.render('users/single -product', { user_header: true, cartCount, singleproduct, user })
  })

})


/////////////////add to cart from product details//////////////////////////////

router.post('/addToCart/:id', (req, res, next) => {
  let cartID = req.params.id
  console.log(cartID);
  productController.addToCart(cartID, req.session.user._id).then((response) => {
    res.json({ response })
  }).catch((err) => {
    next(err)
  })

})


///////////logout from home////////////////////

router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})


router.get('/home', (req, res) => {
  userController.userProfile(req.body).then((userData) => {
    res.render('users/home', { userData })
  })
})


/////////////////////////////////////////wishlist////////////////////////

router.get('/wishlist', verifylogin, async (req, res, next) => {
  let cartCount = null;
  if (req.session.user) {
    cartCount = await productController.getCartCount(req.session.user._id)
  }
  let user = req.session.user
  let userID = req.session.user._id
  productController.getWishItem(userID).then((whishlistitems) => {
    wishlist = response.wishlist
    wishlistEmpty = whishlistitems.wishlistEmpty
    res.render('users/wishlist', { cartCount, user_header: true, user, whishlistitems,wishlistEmpty })
  }).catch((err) => {
    next(err)
  })

})


router.post('/wishlist/:id', (req, res, next) => {
  let userID = req.session.user._id
  let prodId = req.params.id
  productController.addToWishlist(prodId, userID).then((response) => {
    // res.redirect('/')
    res.json(response)

  }).catch((err) => {
    next(err)
  })

})

///////////////////////////////add to cart from wishlist////////////////////

router.post('/addToCart/:id', (req, res, next) => {
  let id = req.params.id
  productController.addToCart(id, req.session.user._id).then((response) => {
    res.json({ response })
  }).catch((err) => {
    console.log(err, "   errorr")
    next(err)
  })
})


///////////////////////////////////delete wishlist///////////////////////////


router.get('/delete-wishlistItem/:id', (req, res, next) => {
  let itemId = req.params.id
  let userId = req.session.user._id
  productController.deleteWishItem(itemId, userId).then((response) => {
    res.redirect('/wishlist')
  }).catch((err) => {
    next(err)
  })
})


//////////////////////////////////////user profile///////////////////////////////////////////



router.get('/userProfile', verifylogin,usermiddleware.isblocked, (req, res, next) => {
  userController.userProfile(req.session.user._id).then((userData) => {
    userController.getAddress(req.session.user._id).then((singleAddress) => {
      res.render('users/userprofile', { userData, singleAddress })
    })
  }).catch((err) => {
    console.log(err, "errorr");
    next(err)
  })
})


router.post('/userProfile', (req, res, next) => {
  userController.addAddress(req.body, req.session.user._id).then((address) => {
    res.redirect('/userProfile')
  }).catch((err) => {
    console.log(err, "errorr");
    next(err)
  })

})


//////////////////////////delete address/////////////////////////////////////

router.get('/deleteAddress/:id', (req, res, next) => {
  let id = req.params.id
  userController.deleteAddress(id).then((response) => {
    // res.json(response)
    res.redirect('/userProfile')
  }).catch((err) => {
    next(err)
  })
})


///////////////////////////edit profile///////////////////////////////////////


router.post('/editProfile/:id', (req, res, next) => {
  let id = req.params.id

  userController.editProfile(req.body, id).then((profileDetails) => {
    // console.log("edited user      ",profileDetails);
    res.redirect('/userProfile')
  }).catch((err) => {
    next(err)
  })
})

//////////////////////////////////edit password////////////////////////

router.post('/editPassword/:id', (req, res) => {

  let id = req.params.id
  userController.editPassword(id, req.body).then((response) => {
    res.redirect('/userProfile')
  }).catch((err) => {
    console.log("errrrrooooorrrrr");
    next(err)
  })
})




//////////////////////////////////////////check out form//////////////////////////////////

router.get('/checkout', verifylogin,usermiddleware.isblocked, (req, res, next) => {
req.session.coupen = null;
  let user = req.session.user
  let totalAmount
  productController.getTotalAmount(req.session.user._id).then((response) => {
    totalAmount = response.totalAmount;
    userController.getAddressToCheck(req.body, req.session.user._id).then((allAddress) => {
      req.session.address = allAddress
      userController.getItemToCheck(req.session.user._id).then((checkItem) => {
        adminController.getCoupens().then((allCoupens) => {
          res.render('users/checkout', { user, user_header: true, allAddress, checkItem, totalAmount, allCoupens })
        })
      })
    })

  }).catch((err) => {
    next(err)
  })
})

////////////////////////////add address from checkout////////////////////////////////////


router.post('/addAddress', (req, res, next) => {
  userController.addAddress(req.body, req.session.user._id).then((checkOutAddress) => {
    res.redirect('/checkout')
  }).catch((err) => {
    next(err)
  })
})


//////////////////////////////////apply coupen//////////////////////////////////////


router.post('/applyCoupen', (req, res, next) => {
  let userid = req.session.user._id
  productController.applyCoupen(userid, req.body).then((response) => {
    req.session.response = response
    if (response) {
      req.session.coupen = response.coupen
      req.session.discount = response.discount
    }
    res.json(response.grandTotal)
    // res.redirect('/checkout')

  }).catch((err) => {
    next(err)
  })
})

//////////////////////////////place order///////////////////////////////////////////


// router.post('/checkOut',verifylogin,(req, res, next) => {
//   console.log("asfasdfaff")
//   let userID = req.session.user._id
//      let coupen = req.session.coupen
//   let coupenDiscount = req.session.response.coupen.coupenDiscount
//   let grandTotal = req.session.response.grandTotal
//   productController.placeOrder(req.body, userID, grandTotal, coupenDiscount).then(async (orderDetails) => {
//     console.log("orderDetails", orderDetails.grandTotal)
//     req.session.orders = orderDetails
//     if (orderDetails.paymentDetails === "COD") {
//       if (req.session.coupen) {
//         await productController.coupenUser(userID, coupen)

//       }
//       res.json({ orderDetails })
//     } else {
//       productController.generateRazorpay(orderDetails._id, orderDetails.grandTotal).then((data) => {
//         res.json({ data })
//       })
//     }

//   }).catch((err) => {
//     console.log("errrrorr", err);
//     next(err)
//   })
// })





router.post('/checkOut',verifylogin,(req, res, next) => {
  console.log("asfasdfaff")
  let userID = req.session.user._id
  if(req.session.coupen){
     let coupen = req.session.coupen
  let coupenDiscount = req.session.response.coupen.coupenDiscount
  let grandTotal = req.session.response.grandTotal
  productController.placeOrder(req.body, userID, grandTotal, coupenDiscount).then(async (orderDetails) => {
    console.log("orderDetails", orderDetails.grandTotal)
    req.session.orders = orderDetails
    if (orderDetails.paymentDetails === "COD") {
      if (req.session.coupen) {
        await productController.coupenUser(userID, coupen)

      }
      res.json({ orderDetails })
    } else {
      productController.generateRazorpay(orderDetails._id, orderDetails.grandTotal).then((data) => {
        res.json({ data })
      })
    }

  }).catch((err) => {
    console.log("errrrorr", err);
    next(err)
  })
}else {

  productController.placeOrder(req.body, userID).then(async (orderDetails) => {
    console.log("orderDetails", orderDetails)
    req.session.orders = orderDetails
    if (orderDetails.paymentDetails === "COD") {
      if (req.session.coupen) {
        await productController.coupenUser(userID, coupen)

      }
      res.json({ orderDetails })
    } else {
      productController.generateRazorpay(orderDetails._id, orderDetails.totalPrice).then((data) => {
        console.log("asdfasd ",data)
        res.json({ data })
      })
    }

  }).catch((err) => {
    console.log("errrrorr", err);
    next(err)
  })
}
})
/////////////////////////////////verify Payment/////////////////////////////////


router.post('/verifyPayment',(req, res) => {
  productController.verifyPayment(req.body).then((data) => {
    productController.changePaymentStatus(req.body.order.receipt).then((response) => {
      console.log("Payment Successfull")
      res.json({ status: true })
    }).catch((error) => {
      console.log(error)
      res.json({ status: false })
    })
  })
})



/////////////////////////////my orders///////////////////////////////////////////////

router.get('/orders',verifylogin,usermiddleware.isblocked, async (req, res, next) => {
  let id = req.session.user._id
  let user = req.session.user
  let cartCount = null;
  if (req.session.user) {
    cartCount = await productController.getCartCount(req.session.user._id)
  }
  productController.getOrderCount(id).then((OrderCount) => {

    productController.myOrders(id).then((allOrders) => {
      res.render('users/myOrders', { user, user_header: true, allOrders, cartCount })
    }).catch((err) => {
      console.log("errrrorrr  ", err);
      next(err)
    })
  })
})

/////////////////////////////////cancel orders///////////////////////////////////////////


router.post('/cancelOrder/:id',(req,res) => {
  let id = req.params.id
  userController.cancelOrder(id).then((response)=>{
    res.json({response})
  })
})



///////////////////////////////////////////track from my orders////////////////////////


router.get('/trackOrder/:id',verifylogin,usermiddleware.isblocked,(req, res) => {
  let id = req.params.id
  let user = req.session.user
  let session = req.session
  productController.getTrack(id).then((trackDetails) => {
    res.render('users/trackOrderFromDetails', { user, trackDetails,session, user_header: true })
  })
})


////////////////////////////////category details/////////////////////////////////////

router.get('/view-products/:id',verifylogin,usermiddleware.isblocked, async (req, res) => {
  let user = req.session.user
  let id = req.params.id
  let cartCount = null;
  if (req.session.user) {
    cartCount = await productController.getCartCount(req.session.user._id)
  }
  productController.categoryProducts(id).then((categoryProducts) => {
    res.render('users/categoryProducts', { user_header: true, user, categoryProducts, cartCount })
  })
})


//////////////////////////////////edit address///////////////////////////////////////

router.post('/editaddress/:id',(req,res) => {
  let id = req.params.id
  userController.editAddress(req.body,id).then((response) => {
    res.redirect('/checkout')
  })
})

module.exports = router;
