import jwt from "jsonwebtoken"
import { User } from "../models/User.js"
import ErrorHandler from "../utils/errorHandler.js"
import { catchAsyncError } from "./catchAsyncError.js"


export const isAuthenticated = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies

  if (!token) return next(new ErrorHandler("Not Loggen In", 401))

  //"jwt.verify" to verify and "jwt.sign" to sign
  const decoded = jwt.verify(token, process.env.JWT_SECRET) //there is object now in decoded so when we do decoded.id we will get id because we have create token on this basis

  req.user = await User.findById(decoded._id)

  next() //next middleware will executed it may be other or ErrorHandler

})


export const authorizeAdmin = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(
      new ErrorHandler(
        `${req.user.role} is not allowed to access this resource`, 403
      )
    )
  }
  next()
}