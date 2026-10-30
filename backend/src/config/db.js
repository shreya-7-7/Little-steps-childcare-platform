import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    const options = {
      dbName: process.env.DB_NAME || "test",
    };

    await mongoose.connect(mongoUri, options);

    console.log("MongoDB Connected to database:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB Connection Failed");
    console.error(error.message);

    throw error;
  }
};

export default connectDB;
