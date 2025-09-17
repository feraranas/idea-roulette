import OpenAI from "openai";

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5";

export const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY, defaultQuery: { model: OPENAI_MODEL } });
};
