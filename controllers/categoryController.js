const { promise } = require('bcrypt/promises')
const { ObjectID } = require('bson')
const { response } = require('express')
const async = require('hbs/lib/async')
const { resolve, reject } = require('promise')
const categoryModel = require('../models/categoryModel')
const fs = require('fs');


module.exports = {

    addcategoryData: (categorydata) => {
        console.log(categorydata, 'category')



        return new Promise(async (resolve, reject) => {
            try {
                categorydata.categoryname = categorydata.categoryname.toUpperCase()
                console.log(categorydata, 'category')
                let category = await categoryModel.findOne({ categoryname: categorydata.categoryname, image: categorydata.image }).lean()
                let response = {
                    exist: false
                }

                if (!category) {
                    console.log('helo')


                    categoryModel.create(categorydata).then((data) => {
                        response.exist = false
                        response.category = categorydata
                        resolve(response)
                    }).catch((err) => {
                        console.log("error at creating", err);
                        resolve(err)
                    })


                } else {
                    console.log('hi')
                    response.exist = true
                    response.category = categorydata
                    resolve(response)

                }
            } catch (error) {
                reject(error)
            }

        })
    },


    getcategory: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let category = await categoryModel.find({}).lean()
                resolve(category)
            } catch (error) {
                reject(error)
            }
        })
    },



    deletecategory: (categoryid) => {
        return new Promise((resolve, reject) => {
            try {
                categoryModel.findByIdAndDelete({ _id: ObjectID(categoryid) }).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }

        })
    },


    getcategorydata: (categoryid) => {
        return new Promise(async (resolve, reject) => {
            try {
                let categorydata = await categoryModel.findOne({ _id: ObjectID(categoryid) }).lean()
                resolve(categorydata)
            } catch (error) {
                reject(error)
            }

        })
    },

    updatecategory: (categoryid, categoryDetails) => {
        categoryDetails.categoryname = categoryDetails.categoryname.toUpperCase()
        return new Promise(async (resolve, reject) => {
            try {
                await categoryModel.findByIdAndUpdate(categoryid, {
                    categoryname: categoryDetails.categoryname,
                    image: categoryDetails.image
                }).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })
    }



}
