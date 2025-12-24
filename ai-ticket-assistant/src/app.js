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
import { userRouter } from "./routes/user.routes.js";
import { ticketRouter } from "./routes/ticket.routes.js";

// defining routes
app.use("/api/users", userRouter)
app.use("/api/tickets", ticketRouter)