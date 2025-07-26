import mongoose from "mongoose";

export  async function connectMongoDb() {

   await  mongoose.connect(process.env.MONGO_DB_URL)
};


