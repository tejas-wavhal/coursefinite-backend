import multer from "multer";

const storage = multer.memoryStorage()  //it is useful => as the refrence is finished from req.body it will delete with it

const singleUpload = multer({storage}).single("file")

export default singleUpload