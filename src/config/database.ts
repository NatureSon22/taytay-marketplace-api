import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.URI_DB as string);
    console.log("Database connected successfully!");
  } catch (error) {
    console.log(error);
    await mongoose.disconnect();
  }
};

export default connectDB;
