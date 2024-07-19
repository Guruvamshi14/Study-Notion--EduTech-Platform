const express = require("express");
const router = express.Router()

const {createCourse, getAllCourses, getCourseDetails,deleteCourse} = require("../controllers/Course");
// console.log({createCourse, getAllCourses, getCourseDetails});
const {createSection, updateSection, deleteSection} = require("../controllers/Section");
// console.log({createSection, updateSection, deleteSection});
const {createSubSection, updateSubSection, deleteSubSection} = require("../controllers/SubSection");
// console.log({createSubSection, updateSubSection, deleteSubSection});
const { auth, isInstructor, isAdmin, isStudent} = require("../middlewares/auth");
// console.log({ auth, isInstructor, isAdmin, isStudent});



router.post("/createCourse", auth, isInstructor, createCourse)
router.delete("/deleteCourse", auth, isInstructor, deleteCourse)
router.post("/addSection", auth, isInstructor, createSection)
router.post("/updateSection", auth, isInstructor, updateSection)
router.post("/deleteSection", auth, isInstructor, deleteSection)
router.post("/updateSubSection", auth, isInstructor, updateSubSection)
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
router.post("/addSubSection", auth, isInstructor, createSubSection)
router.get("/getAllCourses", getAllCourses)
router.post("/getCourseDetails", getCourseDetails)


const {showAllCategories, createCategory, categoryPageDetails} = require("../controllers/Category");



router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)



const {createRating, getAverageRating, getAllRating} = require("../controllers/RatingAndReview");
// console.log({createRating, getAverageRating, getAllRating});
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)

module.exports = router