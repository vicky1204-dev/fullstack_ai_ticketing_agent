import express from "express";
import cors from "cors";

export const app = express();

// configuration middlewares
app.use(
  cors({
    // origin:
    credentials: true,
  })
);
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// importing routes

// defining routes