const category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    //validation
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    //Checking whether the categoey exist or not
    const categoryExist = await category.findOne({name:name});
    if(categoryExist){
      return res.json({
        success:false,
        message:"Already Category Exist"
      });
    }

    //create entry in DB
    const categoryDetails = await category.create({
      name: name,
      description: description,
    });
    // console.log(categoryDetails);

    return res.status(200).json({
      success: true,
      message: "Course Created Successfully",
      categoryDetails
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get All the Categories
exports.showAllCategories = async (req, res) => {
  try {

    //Fetching all the categories from the DB
    const allCategories = await category.find(
      {},
      { name: true, description: true }
    );
    res.status(200).json({
      success: true,
      message: "All the tas are Succesfully Returned",
      allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.categoryPageDetails = async (req,res) => {

  try{

      //Data from the body
      const{ categoryId } = req.body;

      //Fetching the Categories from the DB
      const selectedCategory = await category.findById(categoryId)
			.populate("courses")
			.exec();
		  console.log(selectedCategory);

      if (!selectedCategory) {
        console.log("Category not found.");
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }

      //if no courses is present in the array
      if(selectedCategory.courses.length === 0){
        console.log("No courses found for the selected category.");
        return res.status(404).json({
          success: false,
          message: "No courses found for the selected category.",
        });
      }

      const selectedCourses = selectedCategory.courses;


      // courses which are a not considered under the give category
      const categoriesExceptSelected = await category.find({
        _id: { $ne: categoryId },
      }).populate("courses");
      let differentCourses = [];
      for (const category of categoriesExceptSelected) {
        differentCourses.push(category.courses);
      }

      res.status(200).json({
        selectedCourses: selectedCourses,
        differentCourses: differentCourses,
      });

  }catch(err){
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
  }

};