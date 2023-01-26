import express from "express";
import { addLecture, createCourse, deleteCourse, deleteLecture, getAllCourses, getCourseLectures } from "../controllers/courseController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router()

//Get all Courses without Lectures
router.route("/courses").get(getAllCourses)

//Create new Course - only admin
router.route("/createcourse").post(isAuthenticated, authorizeAdmin, singleUpload, createCourse)

// Get Course Details, Add lecture, Delete Course
router.route("/course/:id")
.get(isAuthenticated, getCourseLectures)
.post(isAuthenticated, authorizeAdmin, singleUpload, addLecture)
.delete(isAuthenticated, authorizeAdmin, deleteCourse)

//Delete lecture
router.route("/lecture").delete(isAuthenticated, authorizeAdmin, singleUpload, deleteLecture)


export default router;