const { promise } = require('bcrypt/promises');
const async = require('hbs/lib/async');
const { ConnectionCheckOutFailedEvent } = require('mongodb');
const { resolve, reject } = require('promise');
const userModel = require('../models/userModel');
const dotenv = require('dotenv')
dotenv.config({path:"./config.env"})



let config = {
    serviceSid: process.env.serviceSid,
    accountSID: process.env.accountSID,
    authToken: process.env.authToken
};

const client = require('twilio')(config.accountSID, config.authToken);




module.exports = {
    getOtp: (number) => {


        return new Promise(async (resolve, reject) => {
            try {
                let user = await userModel.findOne({ phonenumber: number });

                let response = {}
                
                if (user) {
                    response.exist = true;
    
                    if (!user.ActiveStatus) {
                        client.verify.v2.services(config.serviceSid).verifications.create({
                            to: '+91' + number,
                            channel: "sms"
                        })
                            .then((data) => {
                                console.log("response")
                                response.data = data;
                                response.user = user;
                                response.email = user.email
                                response.ActiveStatus = true;
                                resolve(response)
                                //console.log(response)
                            }).catch((err) => {
                                console.log("ERROR FOUND AT VERIFYING");
                                reject(err)
                            })
                    } else {
                        response.userBlocked = true;
                        //console.log('heheheh');
                        resolve(response);
    
                    }
    
                } else {
                    response.exist = false
                    /// console.log("asdfdfhhgjjkl");
                    resolve(response)
                }
            } catch (error) {
                reject(error)
            }
          

        })
    },


    checkOtp: (otp, number) => {
       

        return new Promise((resolve, reject) => {
            try {
                let phonenumber = "+91" + number;
                client.verify.v2.services(config.serviceSid).verificationChecks.create({
                    to: phonenumber,
                    code: otp
                }).then((verification_check) => {
                    console.log(verification_check.status);
                    console.log("verification succsess");
                    resolve(verification_check.status)
                }).catch((err) => {
                    console.log("error", err);
                }) 
            } catch (error) {
                reject(error)
            }
      
        });
    }

}

















































































