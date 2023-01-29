import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import ErrorHandler from "../utils/errorHandler.js"
import { User } from "../models/User.js"
import { sendToken } from "../utils/sendToken.js"
import { sendEmail } from "../utils/sendEmail.js"
import crypto from "crypto"
import { Course } from "../models/Course.js"
import cloudinary from "cloudinary"
import getDataUri from "../utils/dataUri.js"

//REGISTER
export const register = catchAsyncError(async (req, res, next) => {

  const { name, email, password } = req.body
  const file = req.file


  if (!name || !email || !password || !file) return next(new ErrorHandler("Please Enter all feild", 400))

  let user = await User.findOne({ email })

  if (user) return next(new ErrorHandler("User already exists", 409))

  const fileUri = getDataUri(file)
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content) //Upload on Cloudinary

  user = await User.create({  //this is done when user doesn't already exists to create new user 
    name,
    email,
    password,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    }
  })
  sendToken(res, user, "Registered Successfully", 201)
})


//LOGIN
export const login = catchAsyncError(async (req, res, next) => {

  const { email, password } = req.body


  if (!email || !password) return next(new ErrorHandler("Please Enter all feild", 400))

  const user = await User.findOne({ email }).select("+password")    //select("+password") because when we try to login it will show error because we have (select:false) in User Modal password due to which we weren't accepting password
  // console.log(user)
  if (!user) return next(new ErrorHandler("Incorrect Email or Password", 401))

  const isMatch = await user.comparePassword(password)   //checks that user is there or not & returns true of false
  // console.log(isMatch)
  if (!isMatch) return next(new ErrorHandler("Incorrect Email or Password", 401))
  sendToken(res, user, `Welcome back, ${user.name}`, 200)   //"sendToken" to store/access cookies
})


//LOGOUT
export const logout = catchAsyncError(async (req, res, next) => { //doing cookie empty //⭕
  res.status(200).cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  }).json({
    success: true,
    message: "Logged Out Successfullly"
  })
})


//GET MY PROFILE
export const getMyProfile = catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.user._id)  //⭕⭕ how user id will be recieved by req.user._id ?

  res.status(200).json({
    success: true,
    user
  })
})

// DELETE MY PROFILE 
export const deleteMyProfile = catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.user._id)  //⭕⭕ how user id will be recieved by req.user._id ?

  await cloudinary.v2.uploader.destroy(user.avatar.public_id)

  //cancel subscription

  await user.remove()

  res.status(200)
    .cookie("token", null, { //Deleting Cookies
      expires: new Date(Date.now())
    })
    .json({
      success: true,
      message: "Profile Deleted Successfully"
    })
})

//CHANGE PASSWORD
export const changePassword = catchAsyncError(async (req, res, next) => {

  const { oldPassword, newPassword } = req.body

  if (!oldPassword || !newPassword) return next(new ErrorHandler("Please Enter all feild", 400))

  const user = await User.findById(req.user._id).select("+password")

  const isMatch = await user.comparePassword(oldPassword)   //checks that user is there or not & returns true of false

  if (!isMatch) return next(new ErrorHandler("Incorrect Old Password", 400))

  //else
  user.password = newPassword; //password modified

  await user.save();  //don't need to hash pass again and again cause we have said in User Modal that whenever pass isModified then hash

  res.status(200).json({
    success: true,
    message: "Password Changed Successfully"
  })
})


// UPDATE PROFILE
export const updateProfile = catchAsyncError(async (req, res, next) => {

  const { name, email } = req.body

  const user = await User.findById(req.user._id)

  if (name) user.name = name
  if (email) user.email = email

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully"
  })
})


//UPDATE PROFILE PICTURE
export const updateProfilePicture = catchAsyncError(async (req, res, next) => {
  const file = req.file
  const user = await User.findById(req.user._id)

  const fileUri = getDataUri(file)
  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content) //Upload on Cloudinary

  await cloudinary.v2.uploader.destroy(user.avatar.public_id)

  user.avatar = {
    public_id: mycloud.public_id,
    url: mycloud.secure_url,
  }

  await user.save()

  res.status(200).json({
    success: true,
    message: "Profile Picture Updated Successfully"
  })
})


//FORGET PASSWORD 
export const forgetPassword = catchAsyncError(async (req, res, next) => {

  const { email } = req.body;

  const user = await User.findOne({ email })

  if (!user) return next(new ErrorHandler("No user found with this Email Address", 400))

  // if user
  const resetToken = await user.getResetToken()//reset token will get from user modal

  await user.save()

  //Send above token via email
  const url = `${process.env.FRONTEND_URL}/api/v1/resetpassword/${resetToken}` //  http://localhost:3000/api/v1/resetpassword/randomtoken
  const message = `Click on the link to reset password.${url}.If you have not request then please ignore`
  await sendEmail(user.email, "Coursefinite Reset Password", message)

  res.status(200).json({
    success: true,
    message: `Reset Token has been sent to ${user.email}`
  })
})


// RESET PASSWORD
export const resetPassword = catchAsyncError(async (req, res, next) => {

  const { token } = req.params //Note: {token} because route /resetpassword/:token is given for resetPassword

  const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex")    //⭕RATTA //"sha256" is algorithm there are many algorithm can check on google. //THIS WHOLE SYNTAX WILL RETURN A TOKEN WHICH WILL BE HASHED

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { //⭕RATTA
      $gt: Date.now()
    }
  })

  if (!user) return next(new ErrorHandler("Token is Invalid or has been expired"))

  // if user
  user.password = req.body.password
  user.resetPasswordToken = undefined //cause not point of resetPasswordToken after reseting the password
  user.resetPasswordExpire = undefined //cause not point of resetPasswordExpire after reseting the password

  await user.save()


  res.status(200).json({
    success: true,
    message: "Password Changed Successfully",
  })
})


//ADD TO PLAYLIST
export const addToPlaylist = catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.user._id)

  const course = await Course.findById(req.body.id)

  const itemExists = user.playlist.find((e) => {
    if (e.course.toString() === course._id.toString()) return true
  })

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404))

  if (itemExists) return next(new ErrorHandler("Item Already Exists", 409))

  // if course
  user.playlist.push({
    course: course._id,
    poster: course.poster.url
  })

  await user.save()

  res.status(200).json({
    success: true,
    message: "Added to Playlist",
  })
})


//REMOVE FROM PLAYLIST
export const removeFromPlaylist = catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.user._id)

  const course = await Course.findById(req.query.id)    //query.id cause we dont wanna sens this via body

  if (!course) return next(new ErrorHandler("Invalid Course Id", 404))

  const newPlaylist = user.playlist.filter((e) => {
    if (e.course.toString() !== course._id.toString()) return e
  })

  user.playlist = newPlaylist

  await user.save()

  res.status(200).json({
    success: true,
    message: "Removed from Playlist",
  })
})





//ADMIN CONTROLLERS 😎👑

// GET ALL USERS
export const getAllUsers = catchAsyncError(async (req, res, next) => {

  const users = await User.find({})

  res.status(200).json({
    success: true,
    users
  })
})

// UPDATE USER ROLE
export const updateUserRole = catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.params.id)

  if (!user) return next(new ErrorHandler("User not Found", 404))

  if (user.role === "user") user.role = "admin"
  else user.role = "user"

  await user.save()

  res.status(200).json({
    success: true,
    message: "User Role Updated Successfully"
  })
})

// UPDATE USER ROLE
export const deleteUser = catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.params.id)

  if (!user) return next(new ErrorHandler("User not Found", 404))

  await cloudinary.v2.uploader.destroy(user.avatar.public_id)

  //cancel subscription

  await user.remove()

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully"
  })
})

// GET STATS
export const getStats = catchAsyncError(async (req, res, next) => {

  const users = await User.find({})
  const courses = await Course.find({})

  res.status(200).json({
    success: true,
    totalUsers: users.length,
    totalCourses: courses.length,
    totalViews: courses.map(item => item.views).reduce((prev, next) => prev + next),   //Returns sum of views of all courses of array of an object
    totalLectures: courses.map(item => item.numOfVideos).reduce((prev, next) => prev + next)   //Returns sum of lectures of all courses of array of an object
  })
})
