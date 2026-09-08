import mongoose from "mongoose";

const { connect } = mongoose || {};

export async function connectMongoDb() {
  const { env: { MONGO_DB_URL, MONGO_DB_NAME, MONGO_APP_NAME } = {} } = process || {};
  await connect(MONGO_DB_URL, {
    dbName: MONGO_DB_NAME,
    appName: MONGO_APP_NAME,
  });
}