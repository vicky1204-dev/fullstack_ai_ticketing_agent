import { NonRetriableError } from "inngest";
import {User} from "../../src/models/user.model.js";
import { inngest } from "../client.js";
import { sendMail } from "../../src/utils/mailer.util.js";

export const onUserSignUp = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      const user = await step.run("get-user-from-email", async () => {
        userObject = await User.findOne(email);
        if (!userObject) throw new NonRetriableError();
        return userObject;
      });

      await step.run("send-welcome-mail", async () => {
        const subject = `Welcome to the app`;
        const emailContent = `Hey! \n \n We are very happy to have you on board!`;
        await sendMail(user.email, subject, emailContent);
      });

      return {success: true}
    } catch (error) {
        console.error("Error running step:", error.message)
        return{success:false}
    }
  }
);
