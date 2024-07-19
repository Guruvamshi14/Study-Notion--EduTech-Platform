const Subsection = require('../models/SubSection');
const Section = require("../models/section");

const {uploadImageToCloudianry} = require('../utils/imageUpload');

exports.createSubSection = async (req,res) => {
    try{

         //fecth data from Req body
         const {sectionId, title, timeDuration, description} = req.body;
         //extract file/video
         const video  = req.files.videoFile;
         console.log("Video ",video);
         console.log("Section",sectionId);
         
        //Validation
         if(!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
         };

        //  console.log("Hai");

        const uploadDetails = await uploadImageToCloudianry(video,process.env.FOLDER_NAME);

        // console.log(uploadDetails);

        //reating an entry in DB
        const subSectionDetails = await Subsection.create({
                title:title,
                timeDuration:timeDuration,
                description:description,
                videoUrl:uploadDetails.secure_url,
        });

        // upading the Section Schema 
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            { $push: { subSection: subSectionDetails._id } },
            { new: true }
          ).populate("subSection").exec();

        return res.status(200).json({
            success:true,
            message:'Subsection is created Successfully',
            updatedSection,
        })


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message,
         });
    }

};





exports.updateSubSection = async(req,res) => {

    try{

        //Data from the Body
        const { sectionId, title, description } = req.body;
        const subSection = await Subsection.findById({_id:sectionId});
        console.log(subSection);
    
        if (!subSection) {
          return res.status(404).json({
            success: false,
            message: "SubSection not found",
          })
        }
    
        if (title !== undefined) {
          subSection.title = title
        }
    
        if (description !== undefined) {
          subSection.description = description
        }

        //Storing the Video Url 
        if(req.files && req.files.video !== undefined){
            const video = req.files.video;
            const uploadDetails = await uploadImageToCloudianry(
                video,
                process.env.FOLDER_NAME
            )
        Subsection.videoUrl = uploadDetails.secure_url;
        subSection.timeDuration = `${uploadDetails.duration}`
        }
        
        //Savin the details in schmea
        await subSection.save();
  
      return res.json({
        success: true,
        message: "Section updated successfully",
      })


    }catch(error){
        return res.json({
          success: false,
          message: "An error occurred while updating the section",
        })
    }

}

exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await Subsection.findByIdAndDelete({ _id: subSectionId });

      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
  
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }