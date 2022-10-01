const { response } = require('express');
var express = require('express');
var router = express.Router();
const session = require('express-session');
const adminController = require('../controllers/adminController')
const multer = require("multer");
const productModel = require('../models/addproductModel');
const app = require('../app');
const async = require('hbs/lib/async');
const categoryController = require('../controllers/categoryController')
const path = require('path');
const { resolve } = require('path');
const { STATES } = require('mongoose');
const productController = require('../controllers/addproductController');
const { adminlogin } = require('../controllers/adminController');


let verifyAdminlogin = (req, res, next) => {
   if (req.session.admin) {
      next()
   } else {
      res.redirect('/admin')
   }
}


/////////configuration for multer////////////////////

const storage = multer.diskStorage({
   destination: "public/productimages",
   filename: (req, file, cb) => {
      cb(null, Date.now() + '--' + file.originalname);
   }
})

const uploads = multer({
   storage
});





/* GET users listing. */

router.get('/', function (req, res) {
   if (req.session.admin) {
      let admin = req.session.admin
      adminController.getWholeOrders().then((lengthOrder) => {
         adminController.getWholeUsers().then((lengthUsers) => {
            adminController.getTotalIncome().then((totalIncome) => {
               adminController.getPendingOrders().then((totalPending) => {
                  adminController.getCancelledOrders().then((totalCancelled) => {
                     adminController.getDeliverdOrders().then((totalDeliverd) => {
                        adminController.getShippedOrders().then((totalShipped) => {
                           res.render('admin/adminhome', { admin, layout: 'admindashboard', admin_header: true, lengthOrder, lengthUsers, totalIncome, totalPending, totalCancelled, totalDeliverd, totalShipped })
                        })
                     })
                  })
               })
            })
         })
      })

   } else {
      res.render("admin/adminlogin")
   }

})

/////////////////home page rendering and redirect///////////////////


router.get('/adminhome', (req, res) => {
   if (req.session.admin) {
      res.redirect('/admin/adminhome')
   } else {
      let adminnotfound = req.session.adminnotfound
      let wrongpassword = req.session.wrongpassword
      res.render('admin/adminlogin', { adminnotfound, wrongpassword })
   }
})

////////////////////////////////////admin home post method///////////////////////

router.post('/adminhome', (req, res) => {
   adminController.adminlogin(req.body).then((response) => {
      if (response.status) {
         req.session.admin = response.admin
         console.log("admin logged in")
         res.redirect('/admin')
      }
      else if (response.adminnotfound) {
         req.session.adminnotfound = true
         adminnotfound = req.session.adminnotfound
         req.session.wrongpassword = false
         res.redirect('/admin')
      }
      else {
         console.log("admin login failed");
         req.session.adminnotfound = false
         req.session.wrongpassword = true
         res.redirect('/admin')
      }
   })

});

////////////////////////////////////////admin logout/////////////////

router.get('/adminlogout', (req, res) => {
   req.session.destroy()
   res.redirect('/admin')
})

//////////////////////////////////////userdetails///////////////////////

router.get('/userdetails', verifyAdminlogin, (req, res) => {
   adminController.getUserData().then((users) => {
      res.render('admin/userdetails', { users, userdata: true, layout: 'admindashboard', admin_header: true })
   })
}),

   /////////////////////////////blocking user///////////////////////////

   router.get('/block-user/:id', (req, res) => {
      let id = req.params.id
      adminController.block_User(id).then((response) => {
         res.redirect('/admin/userdetails')
      })
   })

/////////////////////////////////////////////////////activating user///////////////////


router.get('/activate-user/:id', (req, res) => {
   let id = req.params.id
   adminController.activate_User(id).then((response) => {
      res.redirect('/admin/userdetails')
   })
})




////////////////////////Category management//////////////////////////

router.get('/category', verifyAdminlogin, (req, res) => {
   categoryController.getcategory().then((category) => {
      if (req.session.categoryexist) {
         let categoryexist = req.session.categoryexist
         res.render('admin/category', { category, layout: 'admindashboard', admin_header: true, categoryexist })
         req.session.categoryexist = null
      } else {
         res.render('admin/category', { category, layout: 'admindashboard', admin_header: true })
      }
   })
})


////////////////////////Add category data/////////////////////////////



router.post('/addcategory', uploads.array("image", 3), (req, res) => {
   let categoryImages = []
   categoryImages = req.files
   let categoryArray = []
   categoryArray = categoryImages.map((value) => value.filename)
   req.body.image = categoryArray
   categoryController.addcategoryData(req.body).then((response) => {
      if (response.exist) {
         console.log('exist')
         req.session.categoryexist = true
         req.session.category = response.category
         res.redirect('/admin/category')
      } else {
         req.session.category = response.category
         res.redirect('/admin/category')
      }

   })


})

///////////////////////////delete category//////////////


router.get('/delete-category/:_id', (req, res) => {
   let categoryid = req.params._id
   categoryController.checkCategory(categoryid).then((usedCategory) => {
      if (usedCategory[0] == null) {
         categoryController.deletecategory(categoryid).then((data) => {
            res.redirect('/admin/category')
         })
      } else {
         categoryUsed = true
         res.redirect('/admin/category')
      }
   })

})

/////////////////////////update category///////////////////////

router.get('/editcategory/:id', verifyAdminlogin, (req, res) => {
   let categoryid = req.params.id
   categoryController.getcategorydata(categoryid).then((categorydata) => {
      res.render('admin/updatecategory', { categorydata })
   })

})





router.post('/updatecategory/:id', uploads.array("image", 3), (req, res) => {
   let categoryid = req.params.id
   const images = req.files
   let array = []
   array = images.map((value) => value.filename)
   req.body.image = array
   categoryController.updatecategory(categoryid, req.body).then((response) => {
      res.redirect('/admin/category')
   })

})




////////////////////////////////////////////product details//////////////////////////////


router.get('/productdetails', verifyAdminlogin, (req, res) => {
   productController.getallproducts().then((product) => {
      res.render('admin/productdetails', { product, layout: 'admindashboard', admin_header: true })
   })
})





////////////////////////////////////////add products////////////////////////////////////
router.get('/addproduct', verifyAdminlogin, (req, res) => {
   productController.getallCategory(req.body).then((allCategory) => {
      res.render('admin/addproducts', { allCategory })
   })
})



router.post('/addproduct', uploads.array("image", 3), (req, res) => {
   const images = req.files
   let array = []
   array = images.map((value) => value.filename)
   req.body.image = array
   productController.AddProduct(req.body).then((response) => {
      res.redirect('/admin/productdetails')
   }).catch((error) => {
      console.log(error, "error here")
   })
})

/////////////////////////delete product////////////////////////


router.get('/delete-product/:_id', (req, res) => {
   let productID = req.params._id
   productController.deleteProduct(productID).then((response) => {
      res.redirect('/admin/productdetails')
   })
})

///////////////////////Getting Edit product page //////////////////////

router.get('/edit-product/:_id', verifyAdminlogin, (req, res) => {
   let productID = req.params._id
   productController.getProductdetails(productID, req.body).then((productContent) => {
      productController.getallCategory(req.body).then((allCategory) => {
         res.render('admin/updateProduct', { productContent, allCategory })
      })
   })
})

///////////////////////post edit method///////////////////////////////






router.post('/editproduct/:id', uploads.array("image", 3), (req, res) => {
   let productID = req.params.id
   const images = req.files
   let array = []
   array = images.map((value) => value.filename)
   req.body.image = array
   productController.updateProduct(productID, req.body).then((response) => {
      res.redirect('/admin/productdetails')
   })
})



/////////////////////banner management///////////////////////////////


router.get('/banners', verifyAdminlogin, (req, res) => {
   productController.getAllBanners().then((bannerResponse) => {
      res.render('admin/banners', { bannerResponse, layout: 'admindashboard', admin_header: true })
   })

})



/////////////////add banners /////////////////////////////

router.get('/addbanner', verifyAdminlogin, (req, res) => {
   productController.productList(req.body).then((prodList) => {
      res.render('admin/add-banners', { prodList })
   })
})


router.post('/addbanner', uploads.array("image", 3), (req, res) => {
   const bannerimages = req.files
   let bannerArray = []
   bannerArray = bannerimages.map((value) => value.filename)
   req.body.image = bannerArray
   productController.AddBanner(req.body).then((banners) => {
      res.redirect('/admin/banners')
   })

})


/////////////////////////////Delete banners///////////////////////////

router.get('/delete-banners/:id', (req, res) => {
   let bannerID = req.params.id
   productController.deleteBanner(bannerID).then((response) => {
      res.redirect('/admin/banners')
   })
})

////////////////////////edit banners////////////////////////////////

router.get('/edit-banners/:id', verifyAdminlogin, (req, res) => {
   let bannerID = req.params.id
   console.log("bannerID " + bannerID);
   productController.getBanner(bannerID, req.body).then((bannerDetails) => {
      productController.productList(req.body).then((prodList) => {
         console.log("bannerDetails  " + bannerDetails);
         console.log('prodName  ' + prodList);
         res.render('admin/edit-banners', { bannerDetails, prodList })
      })
   })

})



router.post('/editbanner/:id', uploads.array("image", 3), (req, res) => {
   let bannerID = req.params.id
   const editedImages = req.files
   let editedImageArray = []
   editedImageArray = editedImages.map((value) => value.filename)
   req.body.image = editedImageArray
   productController.editBanner(bannerID, req.body).then((response) => {
      res.redirect('/admin/banners')
   })
})


//////////////////////////////////////order management/////////////////////////////

router.get('/orders', verifyAdminlogin, (req, res, next) => {
   adminController.getOrderDetails().then((orderDetails) => {
      res.render('admin/order-management', { admin_header: true, layout: 'admindashboard', orderDetails })
   }).catch((err) => {
      next(err)
   })

})

router.post('/productShip/:id', (req, res) => {
   let id = req.params.id
   adminController.shipProduct(id).then((response) => {
      // res.redirect('/admin/orders')
      res.json({ response })
   })
})

router.post('/productDeliver/:id', (req, res) => {
   let id = req.params.id
   adminController.deliverProduct(id).then((response) => {
      // res.redirect('/admin/orders')
      res.json({ response })
   })
})

router.post('/cancelOrder/:id', (req, res) => {
   let id = req.params.id
   adminController.cancelOrder(id).then((response) => {
      // res.redirect('/admin/orders')
      res.json({ response })
   })
})


////////////////////////coupen management/////////////////////////////

router.get('/coupens', verifyAdminlogin, (req, res, next) => {
   adminController.getCoupens().then((allCoupens) => {
      res.render('admin/coupen', { admin_header: true, layout: 'admindashboard', allCoupens })
   }).catch((err) => {
      next(err)
   })
})


router.post('/coupens', (req, res, next) => {
   adminController.addCoupens(req.body).then((coupens) => {
      res.redirect('/admin/coupens')
   }).catch((err) => {
      next(err)
   })

})

router.get('/delete-coupen/:id', (req, res, next) => {
   let id = req.params.id
   adminController.deleteCoupen(id).then((response) => {
      res.redirect('/admin/coupens')
   }).catch((err) => {
      next(err)
   })

})

router.post('/editCoupens/:id', verifyAdminlogin, (req, res) => {
   let id = req.params.id
   adminController.editCoupen(id, req.body).then((response) => {
      res.redirect('/admin/coupens')
   })
})


router.get('/edit-coupen/:id', verifyAdminlogin, (req, res) => {
   let id = req.params.id
   adminController.coupenForEdit(id).then((editCoupen) => {
      res.render('admin/editCoupen', { editCoupen })
   })
})

router.get('/getdash', (req, res, next) => {
   adminController.stati().then((status) => {
      res.json({ status })
   }).catch((err) => {
      next(err)
   })
})

module.exports = router;
