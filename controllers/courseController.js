import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import { Course } from "../models/Course.js"
import getDataUri from "../utils/dataUri.js"
import ErrorHandler from "../utils/errorHandler.js"
import cloudinary from "cloudinary"

export const getAllCourses = catchAsyncError(async (req, res, next) => {
  const keyword = req.query.keyword || ""  //title
  const category = req.query.category || ""  //category

  // const courses = await Course.find().select("-lectures") //select("-lectures") cause only subscribers should access the lectures
  const courses = await Course.find({
    title: {    
      $regex: keyword,
      $options: "i",
    },
    category: {
      $regex: category,
      $options: "i",
    },
  }) //but now it is wihout subscription
  res.status(200).json({
    success: true,
    courses,
  })
}
)


export const createCourse = catchAsyncError(async (req, res, next) => {

  const { title, description, category, createdBy } = req.body //⭕RATTA

  if (!title || !description || !category || !createdBy) return next(new ErrorHandler("Please add all fields", 400)) //Hear by calling "next" then next middleware will run but there is no other middleware in ./caseroutes.js then the ErrorMiddleware will run and its 1st parameter is "err"  //⭕RATTA

  const file = req.file
  // console.log(file)

  const fileUri = getDataUri(file)

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content) //Upload on Cloudinary

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    }
  })

  res.status(201).json({
    success: true,
    message: "Course Created Successfully. You can add lectures now",
  })
}
)


export const getCourseLectures = catchAsyncError(async (req, res, next) => {
  const course = await Course.findById(req.params.id)

  if (!course) return next(new ErrorHandler("Course not found", 404))

  course.views += 1

  await course.save()

  res.status(200).json({
    success: true,
    lectures: course.lectures
  })
})


export const addLecture = catchAsyncError(async (req, res, next) => {

  const { id } = req.params

  const { title, description } = req.body

  const course = await Course.findById(id)

  if (!course) return next(new ErrorHandler("Course not found", 404))

  const file = req.file

  const fileUri = getDataUri(file)

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "video"
  }) //Upload on Cloudinary
  // Max Video Size 100mb for free Cloudinary

  course.lectures.push({
    title,
    description,
    video: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    }
  })

  course.numOfVideos = course.lectures.length

  await course.save()

  res.status(200).json({
    success: true,
    lectures: "Lecture Added in Course Successfully"
  })
})


export const deleteCourse = catchAsyncError(async (req, res, next) => {

  const { id } = req.params

  const course = await Course.findById(id)

  if (!course) return next(new ErrorHandler("Course not found", 404))

  await cloudinary.v2.uploader.destroy(course.poster.public_id)   //Deleting poster from Cloudinary

  for (let i = 0; i < course.lectures.length; i++) {
    const singleLecture = course.lectures[i];
    await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
      resource_type: "video",
    })   //Deleting lectures videos from Cloudinary
  }

  await course.remove()

  res.status(200).json({
    success: true,
    message: "Course Deleted Successfullf"
  })
}
)


export const deleteLecture = catchAsyncError(async (req, res, next) => {

  const { courseId, lectureId } = req.query

  const course = await Course.findById(courseId)

  if (!course) return next(new ErrorHandler("Course not found", 404))

  const lectures = course.lectures.find((e) => {
    if (e._id.toString() === lectureId.toString()) {
      return e
    }
  })

  await cloudinary.v2.uploader.destroy(lectures.video.public_id, {
    resource_type: "video",
  })   //Deleting lectures videos from Cloudinary

  course.lectures = course.lectures.filter((e) => {
    if (e._id.toString() !== lectureId.toString()) {
      return e
    }
  })

  course.numOfVideos = course.lectures.length

  await course.save()

  res.status(200).json({
    success: true,
    message: "Lecture Deleted Successfullf"
  })
}
)
