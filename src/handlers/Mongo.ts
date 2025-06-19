import mongoose from "mongoose";
import { color } from "../functions";

module.exports = () => {
    const MONGO_URI = process.env.MONGODB_URI;

    if (!MONGO_URI)
        return console.log(color("text", `🍃 Database connection string not found, ${color("error", "skipping.")}`));

    mongoose.connect(`${MONGO_URI}`, { dbName: process.env.MONGODB_NAME })
        .then(() =>
            console.log(color("text", `🍃 MongoDB successfully ${color("variable", "connected.")}`))
        )
        .catch(() =>
            console.log(color("text", `🍃 Failed ${color("error", "to connect")} to MongoDB`))
        );
};
