import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/aiTicketDB`);
    console.log("Connection to database successful!")
  } catch (error) {
    throw new Error(`Connection refused: ${error}`);
  }
};

export { connectDB };
