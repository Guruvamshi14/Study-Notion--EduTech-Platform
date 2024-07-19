const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");


exports.createRating = async(req,res) => {

    try{

        
        const userId = req.user.id;

        //Data from the Body
        const {rating,review,courseId} = req.body;

        // const courseDetails = await Course.find({_id:courseId});

        // const studentEnrolled = courseDetails.studentsEnrolled.includes(userId);

        // if(!studentEnrolled){
        //     return res.status(404).json({
        //         success:false,
        //         message:'Student is not enrolled in the course',
        //     });
        // }

        //checking whether the user is present in the Enrolled Courses or not 
        const courseDetails = await Course.findOne(
            {_id:courseId,
            studentsEnrolled: {$elemMatch: {$eq: userId} },
        });

        if(!courseDetails) {
            return res.status(404).json({
            success:false,
            message:'Student is not enrolled in the course',
            });
        }

        //check whethetr the user alrady reviewed or not 
        const alreadyReviewed = await RatingAndReview.findOne({
            _id:userId,
            Course:courseId
        });


        if(alreadyReviewed) {
            return res.status(403).json({
                success:false,
                message:'Course is already reviewed by the user',
            });
        }

        //Entry in the DataBase
        const ratingReview = RatingAndReview.create({
            review,rating,
            course:courseId,
            user:userId
            });

        //Adding the review in to the course array
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    ratingAndReviews : ratingReview._id
                }
            },{new:true}
        );

        console.log(updatedCourseDetails);
        return res.status(200).json({
            success:true,
            message:"Rating and Review created Successfully",
            ratingReview,
        })

    }
    catch(err){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


exports.getAverageRating = async (req, res) => {
    try {
            //get course ID
            const courseId = req.body.courseId;
            
            //calculate avg rating
            const result = await RatingAndReview.aggregate([
                {
                    $match:{
                        course: new mongoose.Types.ObjectId(courseId),
                    },
                },
                {
                    $group:{
                        _id:null,
                        averageRating: { $avg: "$rating"},
                    }
                }
            ])

            //return rating
            if(result.length > 0) {

                return res.status(200).json({
                    success:true,
                    averageRating: result[0].averageRating,
                })

            }
            
            //if no rating/Review exist
            return res.status(200).json({
                success:true,
                message:'Average Rating is 0, no ratings given till now',
                averageRating:0,
            })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


exports.getAllRating = async(req,res) => {

    try{

        const allReviews = await RatingAndReview.find({})
                                .sort({rating:"desc"})
                                .populate({
                                    path:"user",
                                    select:"firstName lastName email image",
                                })
                                .populate({
                                    path:"course",
                                    select:"courseName",
                                }).exec();

            return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data:allReviews,
            })


    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }

}