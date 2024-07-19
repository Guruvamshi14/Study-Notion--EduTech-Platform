const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const otpTemplate = require('../mail/template/emailVerifiactionTemplate');


const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required: true,
    },
    otp: {
        type:String,
        required:true,
    },
    createdAt: {
        type:Date,
        default:Date.now(),
        expires: 10*60*1000,
    }
});



//a function -> to send emails
async function sendVerificationEmail(email, otp) {
    try{

        console.log(otpTemplate);
        const mailResponse = await mailSender(email, "Verification Email from StudyNotion", otpTemplate(otp));
        console.log("Email sent Successfully: ", mailResponse);
    }
    catch(error) {
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}


OTPSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
}) 


module.exports = mongoose.model("OTP", OTPSchema);
