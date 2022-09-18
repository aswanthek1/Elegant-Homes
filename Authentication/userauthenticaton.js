const async = require('hbs/lib/async');
const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const { response } = require('express');
const Promise = require('promise');
const { resolve, reject } = require('promise');



 

// userexist:(userdata)=>{
//     return new Promise(async(resolve,reject)=>{
//         let {name,email,phonenumber,password,confirmpassword}=userdata
         
//         let response={}
//         console.log(email);
//         let user = await userModel.findOne({email})
//         console.log(user)

//         if(user){
//             response.alreadyRegistered=true
//             resolve(response)
//         }
//         else{
//             response.alreadyRegistered=false
//             resolve(response)
//         }
//     })
// }

