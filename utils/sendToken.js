export const sendToken = (res, user, message, statusCode = 200) => {   //if status code didn't get then it will assus status code 200

  const token = user.getJWTToken()

  const options = {   //⭕RATTA
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,   //if secure=true then token won't save in cookie (in deployment)   -6_pack_programmer
    sameSite: "none"
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user
  })
}