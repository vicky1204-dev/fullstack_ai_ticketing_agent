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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// importing and setting up inngest functions and middleware
import { serve } from "inngest/express";
import { inngest } from "../inngest/client.js";
import { onUserSignUp } from "../inngest/functions/on-signup.js";
import { onCreatedTicket } from "../inngest/functions/on-ticket-created.js";

// importing routes
import { userRouter } from "./routes/user.routes.js";
import { ticketRouter } from "./routes/ticket.routes.js";

// defining routes
app.use("/api/users", userRouter);
app.use("/api/tickets", ticketRouter);

// serving inngest
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onUserSignUp, onCreatedTicket],
  })
);
