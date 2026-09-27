import { NextResponse } from "next/server";
import { getSpainCpi } from "@/lib/sources/es";
import { calculateInflation } from "@/lib/cpi";

export async function GET() {
  try {
    const data = await getSpainCpi();
    return NextResponse.json(calculateInflation(data));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
