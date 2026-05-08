import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // 🔥 Optional but recommended (warnings avoid)
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: false,
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    console.log(
      `MongoDB Connected: ${conn.connection.host}`.bgGreen.bold
    );
  } catch (error) {
    console.error(
      `MongoDB connection error: ${error.message}`.bgRed.bold
    );
    process.exit(1);
  }
};

export default connectDB;
