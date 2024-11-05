import {NextRequest, NextResponse} from 'next/server';
import {z} from "zod";
import pdf from 'pdf-parse';
import assert from "node:assert";

export const runtime = 'nodejs'; // Ensure Node.js runtime

export const Result = z.object({
    amount: z.number().describe("Amount of the invoice"),
    currency: z.string().describe("3 letter code of the currency"),
    isPaid: z.boolean().describe("Is the invoice paid"),
    dueDate: z.string().describe("Due date of the invoice, if not isPaid. ISO 8601 format"),
    items: z.array(z.object({
        description: z.string().describe("Description of the item"),
        amount: z.number().describe("Amount of the item"),
        startDate: z.string().optional().describe("Start date of the item, if applicable. ISO 8601 format"),
        endDate: z.string().optional().describe("End date of the item, if applicable. ISO 8601 format"),
    })).describe("Items in the invoice"),

})

assert(process.env.GOOGLE_CREDENTIALS)
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

export async function GET(req: NextRequest) {
    return NextResponse.json({message: 'Use POST'});

}


export async function POST(req: NextRequest) {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
        return NextResponse.json(
            {error: 'Expected multipart/form-data'},
            {status: 400}
        );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
        return NextResponse.json(
            {error: 'No file uploaded or invalid file'},
            {status: 400}
        );
    }


    try {

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdf(buffer);
        const extractedText = data.text;
        console.log('Extracted text:', extractedText);

        // const pngBuffer = await convertPdfToSinglePng(buffer);
        // const blob = await put("data.png", pngBuffer, {
        //     access: 'public',
        // });
        // console.log('Uploaded file:', blob.url);
        //const result = await askOpenAI(`Please analyze this invoice. The content has been OCRd into text. Provide summary and list of invoice items. Content: ${analysis}`, Result);
        return NextResponse.json({url: extractedText});
    } catch (error: any) {
        if (error.response) {
            console.error(`Error uploading file and querying. Status: ${error.response.status}`, error.response.data);
        } else {
            console.error('Error uploading file and querying:', error);
        }
        return NextResponse.json(
            {error: 'Failed to upload file and query.'},
            {status: 500}
        );
    }

}