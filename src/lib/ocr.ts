import { AzureKeyCredential } from "@azure/core-auth";
import { DocumentAnalysisClient } from "@azure/ai-form-recognizer";
import assert from "node:assert";

export async function extractDataFromDocument(doc: ArrayBuffer) {
  console.log(`Starting Azure OCR...`);
  assert(process.env.AZURE_INVOICE_ENDPOINT);
  assert(process.env.AZURE_INVOICE_KEY);
  const client = new DocumentAnalysisClient(
    process.env.AZURE_INVOICE_ENDPOINT,
    new AzureKeyCredential(process.env.AZURE_INVOICE_KEY)
  );

  const poller = await client.beginAnalyzeDocument("prebuilt-invoice", doc);
  console.log(`Analyzing invoice with Azure OCR...`);
  return await poller.pollUntilDone();
}
