"use server";

import { z } from "zod";

// We define the strict response schema that the AI must eventually adhere to.
export const QuestionSchema = z.object({
  questions: z.array(z.object({
    text: z.string().describe("The actual question text."),
    options: z.array(z.object({
      text: z.string().describe("The option text."),
      isCorrect: z.boolean().describe("Whether this option is the correct answer. Exactly one must be true.")
    })).length(4)
  }))
});

export type GeneratedQuestions = z.infer<typeof QuestionSchema>;

export async function generateMockQuestions(topic: string, count: number, difficulty: string): Promise<GeneratedQuestions> {
  // Simulate network latency as if we were querying the LLM
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // In production, we would use:
  // import { generateObject } from 'ai';
  // import { google } from '@ai-sdk/google';
  // const { object } = await generateObject({ 
  //   model: google('models/gemini-1.5-flash'), 
  //   schema: QuestionSchema, 
  //   prompt: \`Generate \${count} questions about \${topic} at \${difficulty} difficulty.\` 
  // });

  // Return mocked data perfectly matching the Zod schema
  return {
    questions: Array.from({ length: count }).map((_, i) => ({
      text: `[Mock AI] What is a critical aspect of ${topic} concept #${i + 1}? (Difficulty: ${difficulty})`,
      options: [
        { text: "This is a plausible distractor.", isCorrect: false },
        { text: "This is completely wrong.", isCorrect: false },
        { text: "This is the perfectly correct answer.", isCorrect: true },
        { text: "This is another tricky distractor.", isCorrect: false },
      ].sort(() => Math.random() - 0.5) // random shuffle
    }))
  };
}
