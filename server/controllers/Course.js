const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudianry } = require("../utils/imageUpload");

//Create Course Handler
exports.createCourse = async (req, res) => {
  try {
    //fetch the data
    const { courseName, courseDescription, whatYouWillLearn, price, tag, category} = req.body;

    //file(image)
    const thumbnail = req.files.thumbnailImage;

    console.log({ courseName, courseDescription, whatYouWillLearn, price, tag, category, thumbnail});

    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
  
    //user Id id can availiable after the authentication
    const userId = req.user.id;
    const instructorDetails = await User.findById(userId);
    console.log("Instructor Details: ", instructorDetails);
    

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details not found",
      });
    }

    //valid Tag or not
    const CourseDetails = await Category.findById(category);
    if (!CourseDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details not found",
      });
    }

    //upload to cloudinary
    const thumbnailImage = await uploadImageToCloudianry(
      thumbnail,
      process.env.FOLDER_NAME
    );

    //create an entry for new Course
    const newCourse = await Course.create({
      courseName:courseName,
      courseDescription:courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price:price,
      tag: tag,
      category: category,
      thumbnail: thumbnailImage.secure_url,
    });

    //adding the new course to the user Schema
    await User.findByIdAndUpdate(
      { _id: instructorDetails._id },
      {
        $push:{
          courses: newCourse._id,
        },
      },
      { new: true }
    );

    //adding the new course to the category Schema 
    await Category.findByIdAndUpdate(
      {
        _id:category,
      },
      {
        $push:{
          courses: newCourse._id,
        },
      }
    );

    const course = await Course.findById(newCourse._id).populate('category').populate('instructor').exec();

    //return response
    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Course",
      error: error.message,
    });
  }
};


exports.getAllCourses = async (req, res) => {
	try {
    //fectching all the courses from the DB
		const allCourses = await Course.find(
			{},
			{
				courseName: true,
				price: true,
				thumbnail: true,
				instructor: true,
				ratingAndReviews: true,
				studentsEnroled: true,
			}
		)
			.populate("instructor")
			.exec();
		return res.status(200).json({
			success: true,
			data: allCourses,
		});
	} catch (error) {
		console.log(error);
		return res.status(404).json({
			success: false,
			message: `Can't Fetch Course Data`,
			error: error.message,
		});
	}
};


exports.getCourseDetails = async (req, res) => {
  try {
          //Data from the request body
          const {courseId} = req.body;
          //Fectching the courses from the DB
          const courseDetails = await Course.find(
                                      {_id:courseId}) // Popilate is used for to modify the id  with the Document
                                      .populate(
                                          {
                                              path:"instructor",
                                              populate:{
                                                  path:"additionalDetails",
                                              },
                                          }
                                      )
                                      .populate("category")
                                      .populate({
                                          path:"courseContent",
                                          populate:{
                                              path:"subSection",
                                          },
                                      })
                                      .exec();

              //validation
              if(!courseDetails) {
                  return res.status(400).json({
                      success:false,
                      message:`Could not find the course with ${courseId}`,
                  });
              }
              //return response
              return res.status(200).json({
                  success:true,
                  message:"Course Details fetched successfully",
                  data:courseDetails,
              })

  }
  catch(error) {
      console.log(error);
      return res.status(500).json({
          success:false,
          message:error.message,
      });
  }
}


exports.deleteCourse = async (req, res) => {

  try {
    //Getting the Data from the Body
    const { courseId } = req.body;

    console.log(courseId);

    //Checking whether there exist a course or not
    const checkCourse = await Course.findById(courseId);
    if (!checkCourse) {
      return res.status(404).json({
        message: "Course not found."
      });
    }

    const instructorDetails = checkCourse.instructor;
    const categoryDetails = checkCourse.category;

    console.log(checkCourse);

    //removing the cousrse from the Instructor Schema
    await User.findByIdAndUpdate(
      { _id: instructorDetails },
      {
        $pull:{
          courses: checkCourse._id,
        },
      },
      { new: true }
    );

    //removing the course from the Category Schema
    await Category.findByIdAndUpdate(
      {
        _id:categoryDetails,
      },
      {
        $pull:{
          courses: checkCourse._id,
        },
      }
    );

    
    //Deleting the Course
    await Course.findOneAndDelete(courseId);

    
    return res.status(200).json({
      message: "Course deleted successfully.",
      data: checkCourse 
    });

  } catch (err) {
    console.error('Error while deleting the course:', err);
    return res.status(500).json({
      message: "Error while deleting the course.",
      error: err.message,
    });
  }
};

