import { NextResponse } from "next/server";
import { getUsCpi } from "@/lib/sources/us";
import { calculateInflation } from "@/lib/cpi";

export async function GET() {
  try {
    const data = await getUsCpi();
    return NextResponse.json(calculateInflation(data));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
