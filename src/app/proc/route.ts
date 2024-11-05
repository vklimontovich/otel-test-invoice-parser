import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractDataFromDocument } from "@/lib/ocr";
import { askOpenAI, getZodBasedSystemPrompt } from "@/lib/structured-ai";
import { tracer } from "@/instrumentation.node";

export const runtime = "nodejs"; // Ensure Node.js runtime

const Result = z.object({
  amount: z.number().describe("Amount of the invoice"),
  currency: z.string().describe("3 letter code of the currency"),
  isPaid: z.boolean().describe("Is the invoice paid"),
  dueDate: z.string().describe("Due date of the invoice, if not isPaid. ISO 8601 format"),
  items: z
    .array(
      z.object({
        description: z.string().describe("Description of the item"),
        amount: z.number().describe("Amount of the item"),
        startDate: z.string().optional().describe("Start date of the item, if applicable. ISO 8601 format"),
        endDate: z.string().optional().describe("End date of the item, if applicable. ISO 8601 format"),
      })
    )
    .describe("Items in the invoice"),
});

export async function GET(req: NextRequest) {
  const span = tracer.startSpan("Invoice Recognition");
  // Add custom attributes or events to the span
  span.setAttribute("customAttribute", "value");
  span.addEvent("Custom event logged", { eventName: "XXXXX" });

  // End the span after the event completes
  span.end();
  return NextResponse.json({ message: "Use POST" });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded or invalid file" }, { status: 400 });
  }

  try {
    const span = tracer.startSpan("Invoice Recognition");
    // Add custom attributes or events to the span
    span.setAttribute("customAttribute", "value");
    span.addEvent("Custom event logged", { eventName: "XXXXX" });

    // End the span after the event completes
    span.end();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const extractedText = await extractDataFromDocument(buffer);
    const result = await askOpenAI(
      `Please analyze this invoice. The content has been OCR'ed into text. Provide summary and list of invoice items (remove items with 0 amount). For all dates - use full ISO format. If time is unclear, use the beginning of a day in UTC.  Content: ${extractedText.content}`,
      Result
    );
    return NextResponse.json({ result });
  } catch (error: any) {
    if (error.response) {
      console.error(`Error uploading file and querying. Status: ${error.response.status}`, error.response.data);
    } else {
      console.error("Error uploading file and querying:", error);
    }
    return NextResponse.json({ error: "Failed to upload file and query." }, { status: 500 });
  }
}
