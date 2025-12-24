import Ticket from "../models/ticket.model.js";
import { inngest } from "../../inngest/client.js";

const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description)
      return res
        .status(400)
        .json({ message: "Tile and description are required" });

    const newTiket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id,
    });
    
    //  trigger inngest event
    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTiket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });

    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTiket,
    });
  } catch (error) {
    console.error("Error creating ticket", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];
    if (user.role !== "user") {
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "_id"])
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ createdBy: user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({tickets});
  } catch (error) {
    console.error("Error getting tickets", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTicket = async (req, res) => {
    // if the role is user, then the user can only view details of his own ticket whereas mod and admin can view the details of any ticket
  try {
    const user = req.user
    let ticket;
    if(user.role !== "user"){
        ticket = Ticket.findById(req.params.id).populate("assignedTo", ["email", "_id"])
    } else {
        ticket = Ticket.findOne({
            createdBy: user._id,
            id: req.params.id
        }).select("title description status createdAt")
    }

    if(!ticket){
        return res.status(404).json({message: "Ticket not found"})
    }

    return res.status(200).json({ticket})
  } catch (error) {
    console.error("Error getting ticket", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createTicket, getTicket, getTickets };
