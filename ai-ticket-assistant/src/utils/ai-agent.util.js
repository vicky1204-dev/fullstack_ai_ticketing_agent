import { createAgent, gemini } from "@inngest/agent-kit";

export const analyzeTicket = async (ticket) => {
  const analyzerAgent = createAgent({
    name: "AI ticket assistant",
    description:
      "For analyzing the tickets and thereby assigning them to users with respective skills",
    model: gemini({
      model: "gemini-1.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
    }),
    system: `You are an expert ai assistant that processes support tickets. Only return a strict JSON object with no extra text, headers or markdowns.
    Your job is to:
    1.summarize the issue
    2.estimate its priority
    3.provide helpful concise notes for human moderators on how to properly answer the query
    4.list relavant technical skills required to answer the query in the ticket

    IMPORTANT:
    -Respond with *only* valid raw JSON data
    -do not include any comments, markdown, code fences, or any extra formatting
    -the format must be a raw json object

    Repeat: do not wrap your output in markdown or code fences or with any extra formatting

    Analyze the support ticket and provide a JSON object with:
    -summary: A short 1-2 sentence summary of the issue
    -priority: one of "low", "medium" or "high"
    -supportNotes: A helpful concise yet detailed enough explaination that a moderator can use on how to properly approach and answer teh question. Include useful external links if possible
    -neededSkills: An array of skills needed to solve the issue, (e.g. ["React", "MongoDB"])

    structure should look something like this e.g.:

    {
    "summary": "Short summary of the ticket",
    "priority": "high",
    "supportNotes": "Approach this question with first explaining..",
    "neededSkills": ["React", "Node.js"],
    }
    `,
  });

 try {
     const response = await analyzerAgent.run(`
       Ticket information:
       -Title: ${ticket.title}
       -Description: ${ticket.description}
       `);

       const raw = response.output[0].content

       const match = raw.match(/```json\s*([\s\S]*?)\s*```/i) //basically a regex expression, if an ai returns some idiotic jargon we use regex expression to remove it
       const jsonString = match ? match[1] : raw.trim()
       return JSON.parse(jsonString)
 } catch (error) {
    console.error("failed to generate proper response,", error)
    return null  
    // watch out for this
 }

};
