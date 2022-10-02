const async = require('hbs/lib/async');
const { reject } = require('promise');
const userModel = require('../models/userModel')

module.exports = {
    isblocked:(req,res,next) =>{
        if(req.session.user){
            new Promise(async(resolve,reject)=>{
                let user = await userModel.findOne({email:req.session.email}) 
                            
               // console.log(user);
                resolve(user)
            }).then((user)=>{
                if(user.status){
                    res.render('admin/error403')
                    
                
                }else{
                    next()
                }
            })
        
        }else{
            next()
        }
    }
}