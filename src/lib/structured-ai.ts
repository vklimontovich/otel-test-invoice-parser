import assert from "node:assert";
import OpenAI from "openai";
import { ZodObject, ZodType } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { tracer } from "@/instrumentation.node";
import { SpanStatusCode } from "@opentelemetry/api";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function sanitizeOpenAiContent(content: string) {
  return content.replace("```json", "").replace("```", "").trim();
}

export function getZodBasedSystemPrompt<T>(structure: ZodType<T>) {
  return `Please don't use markdown, output MUST be a valid parseable JSON. JSON MUST follow the schema below:\n ${JSON.stringify(zodToJsonSchema(structure, "ResultSchema"), null, 2)}`;
}

export async function askOpenAI<T>(question: string | string[], structure: ZodType<T>): Promise<T> {
  if (!(structure instanceof ZodObject)) {
    throw new Error("ZodObject is not supported, use ZodType instead");
  }
  const systemPrompt = getZodBasedSystemPrompt(structure);
  const prompt = typeof question === "string" ? question : question.join("\n");

  const model = "gpt-4o";
  const span = tracer.startSpan("openai.request", {
    attributes: {
      "api.model": model,
      "api.prompt": prompt,
      "api.system_Prompt": systemPrompt,
    },
  });
  try {
    const response = await openai.chat.completions.create({
      model: model,
      temperature: 1,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });

    const content = response.choices[0].message.content as string;
    span.setAttribute("api.response", JSON.stringify(response.choices));
    span.setAttribute("api.total_tokens_used", response.usage?.total_tokens || "0");
    span.setAttribute("api.model", model);

    span.setStatus({ code: SpanStatusCode.OK });

    assert(content, "OpenAI response is empty");
    try {
      return JSON.parse(sanitizeOpenAiContent(content));
    } catch (e) {
      console.log("OpenAI response is not a valid JSON: ", content);
      throw e;
    }
  } catch (error: any) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    span.recordException(error);
    throw error;
  } finally {
    span.end();
  }
}
