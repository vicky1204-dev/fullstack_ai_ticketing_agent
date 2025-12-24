import { NonRetriableError } from "inngest";
import { inngest } from "../client.js";
import Ticket from "../../src/models/ticket.model.js";
import { analyzeTicket } from "../../src/utils/ai-agent.util.js";
import { User } from "../../src/models/user.model.js";
import { sendMail } from "../../src/utils/mailer.util.js";

const onCreatedTicket = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) throw new NonRetriableError("Ticket not found");
        return ticketObject;
      });

      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "unanswered" });
      });

      const analyzedTicketValues = await step.run(
        "ai-processing",
        async () => await analyzeTicket(ticket)
      );
      if (!analyzedTicketValues)
        throw new NonRetriableError(
          "Something went wrong during AI processing"
        );

      const skills = await step.run(
        "analyze-update-ticket",
        async () => {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: ["low", "medium", "high"].includes(
              analyzedTicketValues.priority?.toLowerCase()
            )
              ? analyzedTicketValues.priority.toLowerCase()
              : "unassigned",
            supportNotes: analyzedTicketValues.supportNotes,
            neededSkills: analyzedTicketValues.neededSkills,
          });
          return analyzedTicketValues?.neededSkills;
        }
      );


      //------------------------ Very very Important ------------------------------------

      const assignedUsers = await step.run("assign-questions", async()=>{
        let users = await User.find({
            neededSkills: {
                $elemMatch:{
                    $regex: skills.join("|"),
                    $options: "i"
                }
            }
        })
        if(users.length === 0) {  
            //------------ Because .find method returns an array of MongoDB documents or [] so, !users will never be true

            users = await User.find({
                role: "moderator"
            })
        }

        await Ticket.findByIdAndUpdate(ticket._id, {
            assignedTo: users.map((user)=> user._id)
        })

        return users.map((user) => ({ //  instead of returning the entire user documents as it will take more space, return only what we need, we need emails of moderators to send them mails
            id: user._id,
            email: user.email,
            role: user.role
        }))
      })

      await step.run("send-email-to-moderators", async ()=>{
        const moderators = assignedUsers.filter((user) => user.role === "moderator")
        if(moderators.length === 0) return;

        for(const mod of moderators) {
            await sendMail(mod.email, "Ticket Assigned", `A Ticket has been assigned to you. Please check and respond as quickly as possible. ${ticket.title}`)
        }
      })

      return {success: true}

    } catch (error) {
          console.error("Error running the step:", error.message)
        return{success:false}
    }
  }
);
