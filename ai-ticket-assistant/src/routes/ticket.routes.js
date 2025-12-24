import express from "express"
import {verifyToken} from "../middlewares/auth.middlewares.js"
import { createTicket, getTicket, getTickets } from "../controllers/ticket.controllers.js"

export const ticketRouter = express.Router()

ticketRouter.get("/", verifyToken, getTickets)
ticketRouter.get("/:id", verifyToken, getTicket)
ticketRouter.post("/", verifyToken, createTicket)
