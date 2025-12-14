import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "unanswered",
      enum: ["answered", "unanswered"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    supportNotes: String,
    priority: String,
    neededSkills: [String],
    deadline: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);
