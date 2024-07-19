const mongoose = require("mongoose");
const Category = require("./Category");
const User = require("./User");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
  },
  courseDescription: {
    type: String,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  whatYouWillLearn: {
    type: String,
  },
  courseContent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
  ],
  ratingAndReviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RatingAndReview",
    },
  ],
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  tag: [{
    type: String,
  }],
  category :{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Category"
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  ],
});

courseSchema.pre("save", async function(next) {

  console.log("Premiddle called for Course");

  next();

});


courseSchema.pre("findOneAndDelete", async function(next) {

  try {

    console.log("Premiddle is Called", this.courseName);
    const updateCategory = await Category.findByIdAndUpdate(
      {_id:this.category},
      {
        $pull:{
          courses: this._id
        }
      }
    );

    console.log("Delete Course : ",updateCategory);
    
    next();
  } catch (err) {
    // next(err);

  }
});

module.exports = mongoose.model("Course", courseSchema);
