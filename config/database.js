import mongoose, { connect } from "mongoose";

export const connectDB = async () => {
  const { connection } = await mongoose.set('strictQuery', true).connect(process.env.MONGO_URI,{ useNewUrlParser: true })
  console.log(`🟢MongoDB connected with ${connection.host}`)
}