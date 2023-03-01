import express from "express"
import { config } from "dotenv"
import ErrorMiddleware from "./middlewares/ErrorMidleware.js"
import cookieParser from "cookie-parser";   //⭕so there will be no error while testing "api/v1/me"
import cors from "cors";

config({
  path: "./config/config.env"
})

const app = express()

//Using Middleware
app.use(express.json({limit:'150mb'})); //So that we can access by using req.body in ./courseController.js 
app.use(cookieParser()); //⭕so there will be no error while testing "api/v1/me"
app.use(express.urlencoded({limit: '150mb', extended: true})); //extended: true So that we can access by using req.body in ./courseController.js 

app.use(cors({  //so that we can frontend and backendnwith different website
  origin: process.env.FRONTEND_URL, //Only the front url can access the backend url  //np use of postman/thunderClient now
  credentials: true, //so that we cookies will work after deployment backend
  methods: ["GET", "POST", "PUT", "DELETE"]
}))

// importing and using Routes
import course from "./routes/courseRoutes.js"
import user from "./routes/userRoutes.js"

app.use("/api/v1", course) //hear("/api/v1") is called prefix
app.use("/api/v1", user) //hear("/api/v1") is called prefix



app.get('/', (req, res) => {
  res.send(`<h1>server is working <a href=${process.env.FRONTEND_URL}>Click hear to visit Frontend</a></h1>`)
})

export default app;

app.use(ErrorMiddleware) //When getAllCourses in./courseRoutes and all handler in front of it if no other handler remains then this will get call
