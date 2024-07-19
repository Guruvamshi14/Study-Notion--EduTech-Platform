const Course = require("../models/Course");
const { findById } = require("../models/RatingAndReview");
const Section = require("../models/section");

exports.createSection = async(req,res) => {
    try{

        //Data from from the Body
        const {sectionName, courseId} = req.body;

        //Validation
        if(!sectionName || !courseId) {
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }

        //Crating an entry in DB
        const newSection = await Section.create({sectionName});
        
        //Upadting the course Schema
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,
            {
            $push:{
                courseContent:newSection._id,
            }
            }
        ,{new:true})
        .populate({
            path:'courseContent',
            populate:{
                path: "subSection",
            }
        }).exec();


        //thre are three ways to pouplate noraml, multiple, nested
        //populate both section and sectonSchema 
        return res.status(200).json({
            success:true,
            message:'Section created successfully',
            updatedCourseDetails,
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create Section, please try again",
            error:error.message,
        });
    }
}


exports.updateSection = async (req,res) => {
    try{

        //data input
        const {sectionName, sectionId} = req.body;
        //data validation
        if(!sectionName || !sectionId) {
            return res.status(400).json({
                success:false,
                message:'Missing Properties',
            });
        }

        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new:true});

        //return res
        return res.status(200).json({
            success:true,
            message:'Section Updated Successfully',
        });

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update Section, please try again",
            error:error.message,
        });
    }
};

exports.deleteSection = async (req,res) => {
    try{
        const {sectionId} = req.params

        //validation
        const sectionDetails = await findById(sectionId);

        //Deleting the Section
        await Section.findByIdAndDelete(sectionId);

        //Find the course ID
        const courseId = sectionDetails.courseContent;

        //Updating the Course Schema 
        await Course.findByIdAndUpdate(courseId,
            {
            $pull:{
                courseContent:sectionId,
            }
            }
        );

        return res.status(200).json({
            success:true,
            message:"Section Deleted Successfully",
        })
    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Unable to delete Section, please try again",
            error:err.message,
        });
    }
}

