import { NextRequest, NextResponse } from "next/server";

async function processRequest(req: NextRequest) {
  console.log(`${req.method} ${req.url}${req.body ? ` - ${JSON.stringify(await req.json(), null, 2)}` : ""}`);
  return NextResponse.json({ ok: true });
}

export const GET = processRequest;
export const POST = processRequest;
