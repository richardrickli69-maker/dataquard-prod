// src/app/api/cron/batch-processor/route.ts
import { NextRequest, NextResponse } from "next/server";
import { submitBatchJobs, processBatchResults } from "@/lib/batchPolicyGenerator";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("=== Batch Processor Cron Job Started ===");

    const submitResult = await submitBatchJobs();
    console.log("Submit result:", submitResult);

    await processBatchResults();
    console.log("Batch results processed");

    return NextResponse.json({
      success: true,
      message: "Batch processing completed",
      submitted: submitResult,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, error: "Cron job failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}