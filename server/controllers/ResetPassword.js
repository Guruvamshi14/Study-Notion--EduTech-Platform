const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
// const passwordUpdated = require('../mail/template/passwordUpdate')


exports.resetPasswordToken = async(req,res) => {
    try{

        //Data From user Body
        const {email} = req.body;
        console.log(email);

        //Checking whether the  user is present or not
        const user = await User.findOne({email:email});
        console.log(user);
        if(!user){
            return res.json({
                success: false,
                message : `This ${email} isd not registered with us,Please enter the valid email ID`
            });
        };


        console.log("Hai");
        //Generating the token 
        const token = crypto.randomBytes(20).toString("hex");

        console.log(token);

        console.log("Hai");

        //Stroing the token and time
        //TIme is stored because, token is valid only with the iven time if i tcroeses thrn it will expires 
        const updatedDetails = await User.findOneAndUpdate(
			{ email: email },
			{
				token: token,
				resetPasswordExpires: Date.now() + 3600000,
			},
			{ new: true }
		);

        console.log("updatedDetails ",updatedDetails);
        const url = `http://localhost:3000/update-password/${token}`;

        //Sending the link to user smail
        await mailSender(email,"Password Reset",`Your link for emial verification is ${url}. CLick on the Url to reset your password`);

        res.json({
            updatedDetails,
            token,
            url,
            message:true,
            data:"Email sent succesfully"
        });

    }catch(err){
        return res.json({
			error: err,
			success: false,
			message: `Some Error in Sending the Reset Message`,
		});
    }
};


exports.resetPassword = async(req,res) => {

    try{

        //Data fro the token
        const {password, confirmPassword,token} = req.body;

        
        if(confirmPassword !== password){
            return res.json({
                success:false,
                message:"Password is incorrect"
            });
        }

        //Finding the user based on the token
        const userDetails = await User.findOne({token:token});

        if(!userDetails){
            return res.json({
                success:false,
                message:"Invalid Token"
            });
        }

        //Checking the Time
        if(!(userDetails.resetPasswordExpires > Date.now())){
            return res.status(403).json({
				success: false,
				message: `Token is Expired, Please Regenerate Your Token`,
			});
        }

        //Password is Hashed
        const encryptedPassword = await bcrypt.hash(password,10);

        await User.findOneAndUpdate({token:token},
            {password : encryptedPassword},
            {new:true}
        );

        res.json({
			success: true,
			message: `Password Reset Successful`,
		});

    }catch(err){
        return res.json({
			error: err.message,
			success: false,
			message: `Some Error in Updating the Password`,
		});
    }

};