import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
import crypto from "crypto" //inbuild module

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"]
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: validator.isEmail
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password must br at least 6 characters"],
    select: false //so that when we access user then we will not get password by default
  },
  role: {
    type: String,
    enum: ["admin", "user"], //enum means it will give 2 options
    default: "user" //So that whenever we create user then the default will be "user"
  },
  subscription: { //This both value will come from razorpay
    id: String,
    status: String
  },
  avatar: {
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
  },
  playlist: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId, // is will get from document of mongo db
        ref: "Course" //i will search above id in "Course" Modal
      },
      poster: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String, //default type=String   //this will be used when forget password 
  resetPasswordExpire: String //default type=String   //this will be used when forget password  
})

schema.pre("save", async function (next) {
  //password hash
  if (!this.isModified("password")) return next() //ex=> When we update profile then we are not updating password so by this syntax the password will get hash only when the "password is modified"
  const hashedPassword = await bcrypt.hash(this.password, 10)  //this.password because we are passing the password which is in database of the user as a payload
  this.password = hashedPassword
  next()
})

schema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  }) //this._id because we are passing the id which is in database of the user as a payload
}

schema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

schema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex")

  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")    // "sha256" is algorithm there are many algorithm can check on google. //THIS WHOLE SYNTAX WILL RETURN A TOKEN WHICH WILL BE HASHED

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000

  return resetToken
}

export const User = mongoose.model("User", schema)