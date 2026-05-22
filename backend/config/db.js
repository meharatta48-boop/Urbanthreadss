import mongoose from "mongoose";


const connectDB = async () => {
  const maxRetries = 3;
  let attempts = 0;
  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI environment variable not set.'.bgRed.bold);
    process.exit(1);
  }

  while (attempts < maxRetries) {
    try {
      mongoose.set('strictQuery', true);
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        autoIndex: false,
        maxPoolSize: 20,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`.bgGreen.bold);
      return; // success
    } catch (error) {
      attempts++;
      console.error(`MongoDB connection attempt ${attempts} failed: ${error.message}`.bgRed.bold);
      if (attempts >= maxRetries) {
        console.error('All connection attempts failed. Exiting.'.bgRed.bold);
        process.exit(1);
      }
      // exponential backoff: 2^attempts * 1000 ms
      const waitTime = Math.pow(2, attempts) * 1000;
      console.log(`Retrying in ${waitTime / 1000}s...`.yellow);
      await delay(waitTime);
    }
  }
};

export default connectDB;
