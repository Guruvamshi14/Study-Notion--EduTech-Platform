const Profile = require("../models/Profile");
const User = require("../models/User");
const {uploadImageToCloudianry} = require("../utils/imageUpload");


exports.updateProfile = async (req,res) => {
    try{
        //get data
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;
        //get userId
        const id = req.user.id;

        //validation 
        if(!contactNumber || !gender || !id) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        //find profile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        //profile Data is created at the time of the user accout Creation
        await profileDetails.save();

        //return response
        return res.status(200).json({
            success:true,
            message:'Profile Updated Successfully',
            profileDetails,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            error:error.meaasage,
        });
    }
};


//delete of a Account 
exports.deleteAccount = async (req,res) => {

    try{

        //data from the body
        const id = req.user.id;
        console.log(id);

        //fing the user details
        const userDetails = await User.findById({_id:id});
        if(!userDetails) {
            return res.status(404).json({
                success:false,
                message:'User not found',
            });
        }


        const delPro = await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

    
        console.log(delPro);

        const delUser = await User.findByIdAndDelete(id);

        console.log(delUser);

        return res.status(200).json({
            success:true,
            message:'User Deleted Successfully',
        });

    

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:'User cannot be deleted successfully',
            error
        }); 
    }

};

exports.getUserDetails = async (req,res) => {
    try {
        //get id
        const id = req.user.id;

        //validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        //return response
        return res.status(200).json({
            success:true,
            message:'User Data Fetched Successfully',
            userDetails
        });
       
    }
    catch(error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}


exports.getEnrolledCourses = async(req,res) => {
    try{

        const userID = req.body.id;

        const userDetails = await User.findById({_id:userID}).populate("courses").exec();

        if(!userDetails){
            return res.json({
                success:false,
                message:"User is not Found"
            });
        }

        return res.json({
            success:false,
            message:"User is not Found",
            data: userDetails.courses,
        });
        


    }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
          })
    }
}

exports.updateDisplayPicture = async(req,res) => {

    try{

        const displayPicture = req.files.displayPicture
        const userId = req.user.id;

        const image = await uploadImageToCloudianry(displayPicture,process.env.FOLDER_NAME);

        console.log(image);

        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )
        res.send({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
          })

    }catch(err){
        return res.status(500).json({
            success: false,
            message: err.message,
          })
    }

}