import mongoose, { connect } from "mongoose";

export const connectDB = async () => {
  const { connection } = await mongoose.set('strictQuery', true).connect(process.env.MONGO_URI)
  console.log(`🟢MongoDB connected with ${connection.host}`)
}