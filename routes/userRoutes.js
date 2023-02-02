import express from "express";
import { addToPlaylist, changePassword, deleteMyProfile, deleteUser, forgetPassword, getAllUsers, getMyProfile, getStats, login, logout, register, removeFromPlaylist, resetPassword, updateProfile, updateProfilePicture, updateUserRole } from "../controllers/userController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router()
//to register a new user
router.route("/register").post(singleUpload, register)

//to login
router.route("/login").post(login)

//logout
router.route("/logout").post(logout)

//get my profile
router.route("/me").get(isAuthenticated, getMyProfile) //isAuthenticated 1st so that only login can access this route. non login user will get the error which is in auth.js

//delete my profile
router.route("/me").delete(isAuthenticated, deleteMyProfile)

//change password
router.route("/changepassword").put(isAuthenticated, changePassword)

//update profile
router.route("/updateprofile").put(isAuthenticated, updateProfile)

//update profile picture
router.route("/updateprofilepicture").put(isAuthenticated, singleUpload, updateProfilePicture)

//forget password
router.route("/forgetpassword").post(forgetPassword)

//reset password password
router.route("/resetpassword/:token").put(resetPassword)

//add to playlist
router.route("/addtoplaylist").post(isAuthenticated, addToPlaylist)

//remove from playlist
router.route("/removefromplaylist").delete(isAuthenticated, removeFromPlaylist)




//ADMIN ROUTES 😎👑

//Get all users
router.route("/admin/users").get(isAuthenticated, authorizeAdmin, getAllUsers)

//Get all users
router.route("/admin/user/:id").put(isAuthenticated, authorizeAdmin, updateUserRole)
  .delete(isAuthenticated, authorizeAdmin, deleteUser)

// GET STATS
router.route("/admin/stats").get(isAuthenticated, authorizeAdmin, getStats)

// contact form
router.route("/contact").post(contact);

// Request form
router.route("/courserequest").post(courseRequest);


export default router;