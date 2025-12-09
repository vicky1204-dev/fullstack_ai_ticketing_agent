import { app } from "./app.js";
import dotenv from "dotenv";
import { connectDB } from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("App listening on port " + PORT);
    });
  })
  .catch((err) => {
    console.log("MongoDb connection error" + err);
    process.exit(1);
  });
