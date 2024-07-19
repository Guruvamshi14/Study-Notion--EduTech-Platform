const User = require('../models/User');
const otpGenerator = require('otp-generator');
const OTP = require('../models/OTP');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {passwordUpdated,otpTemplate} = require('../mail/template/passwordUpdate');

const mailSender = require("../utils/mailSender");
const Profile = require("../models/Profile");
require("dotenv").config();




//send Otp

exports.sendotp = async(req,res) => {
    try{

        //input from the post man
        const{email} = req.body;

        // check the user is present or not
        const checkUserPresent = await User.findOne({email});

        //if user is present 
        if(checkUserPresent){
            return res.status(400).json({
                success:true,
                message:'User has already registered',
            })
        }

        //It generates otp with only numbers
        var otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });

        console.log(otp);

        let result = await OTP.findOne({otp: otp});

        //generating new opt untill we find new one
        //some otp Generator will give same otp
        while(result){
            var otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });

            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email,otp};

        //storing in to the DataBase
        const otpBody = await OTP.create(otpPayload);

        console.log("OTP in DB",otpBody);

        res.status(200).json({
            success:true,
            message:`OTP Sent SuccessFully`,
            otpBody,
        })

    }catch(error){

        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
};



//sign up

exports.signup = async(req,res) => {
    try{
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;


        //validation
        if(!firstName || !lastName || !email || !password || !confirmPassword
            || !otp) {
                return res.status(403).json({
                    success:false,
                    message:"All fields are required",
                })
        }

        //password doesn't match
        if(password !== confirmPassword) {
            return res.status(400).json({
                success:false,
                message:'Password and ConfirmPassword Value does not match, please try again',
            });
        }

        //user already present
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:'User is already registered',
            });
        }

        // sort => It will sort all the documents returend by the find function 
        // createdAt:-1 => Indicates that sorting is done in reverse Order
        //limit(1) => it limits the file to number 1
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);

        console.log(recentOtp);

        if(recentOtp.length == 0){
            return res.status(400).json({
                success:false,
                message:'OTPP Not Found',
            })
        }else if(otp !== recentOtp[0].otp){
            return res.status(400).json({
                success:false,
                message:'Invalid OTP',
            })
        }

        //Password is Hashed 
        const hashedPassword = await bcrypt.hash(password,10);

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth: null,
            about:null,
            contactNumer:null,
        });

        //Creating an entry for the user
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
        
        return res.status(200).json({
            success:true,
            message:'User is registered Successfully',
            user,

        });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registrered. Please try again",
        })
    }
}


//login 
exports.login = async(req,res) =>{
    try{

        //Data from the req body
        const {email,password} = req.body;

        //validation
        if(!email || !password)
            return res.status(403).json({
                success:false,
                message:'ALL Fields are requried Plesase try again'
        });


        //user presnt in DB or not
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registrered, please signup first",
            });
        }

        //Comapare password
        if(await bcrypt.compare(password,user.password)){

            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }

            //User is information is stored in the DataBase
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });

            user.token = token;
            user.password = undefined;

            //Setting the time for the token validation
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }

            res.cookie("token",token,options).status(200).json({
                succes:true,
                token,
                user,
                message:'Logged in successfully',
            })



        }else{
            return res.status(401).json({
                success:false,
                message:'Password is incorrect',
            });
        }
        


    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:'Eror while login',
        });
    }
}

//change Password
exports.changePassword = async(req,res) => {

    try{

        const userDetials = await User.findById(req.user.id);

        const{ oldPassword,newPassword,confirmNewPassword } = req.body;

        //validation
        if(!oldPassword || !newPassword || !confirmNewPassword){
            return res.status(401).json({
                success:false,
                message:'Please enter all the details'
            })
        }

        //Comparing the Old Password
        if(oldPassword === newPassword){
            return res.json({
                success:false,
                message:"Old password and new password are same"
            })
        }

        //Password Checking 
        const isPasswordmatch = await bcrypt.compare(oldPassword,userDetials.password);

        //Old Passowrd Doesn't match then User cant Modify the password
        if(!isPasswordmatch){
            return res.stauts(401).json({
                succes:false,
                message:"The password is incorrect"
            })
        }

        if(newPassword !== confirmNewPassword){
            return res.status(400).json({
                success: false,
                message: "The password and confirm password does not match",
            });
        }

        //New password is stored in the DB
        const encryptedPassword = await bcrypt.hash(newPassword,10);
        const updatedUserDetials = await User.findByIdAndUpdate(
            req.user.id,
            { password:encryptedPassword },
            {new:true}
        );

        try{
            //Sending the Mail for SUccesfull Updation of Password
            const info = mailSender(
                updatedUserDetials.email,
                passwordUpdated(
                    updatedUserDetials.email,
                    `Password updated successfully for ${updatedUserDetials.firstName} ${updatedUserDetials.lastName}`
                )
            );

            console.log("Email Sent Succesfully: ",info);
        }catch(err){
            console.error("Error occurred while sending email:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error occurred while sending email",
                    error: err.message,
                });
        }

        return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });


    }catch(err){
        console.error("Error occurred while updating password:", err);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: err.message,
		});
    }
};

