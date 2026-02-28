// src/app/api/cron/batch-processor/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  submitBatchJobs,
  processBatchResults,
} from "@/lib/batchPolicyGenerator";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("=== Batch Processor Cron Job Started ===");

    console.log("Phase 1: Submitting new pending jobs...");
    const submitResult = await submitBatchJobs();

    if (!submitResult) {
      console.log("No pending jobs to submit");
      return NextResponse.json({
        success: true,
        message: "No pending jobs",
      });
    }

    console.log(
      `Submitted batch: ${submitResult.batchId} with ${submitResult.jobCount} jobs`
    );

    console.log("Phase 2: Checking processing batches...");
    const { data: processingBatches, error } = await supabase
      .from("batch_jobs")
      .select("batch_id")
      .eq("status", "processing")
      .not("batch_id", "is", null);

    if (error) {
      console.error("Error fetching processing batches:", error);
    } else if (processingBatches && processingBatches.length > 0) {
      const batchIds = processingBatches.map((b) => b.batch_id);
      console.log(`Processing ${batchIds.length} batches...`);

      for (const batchId of batchIds) {
        try {
          const result = await processBatchResults(batchId);
          console.log(`Batch ${batchId} result:`, result);

          if (result.processed) {
            console.log(
              `Batch ${batchId} completed: ${result.successCount} success, ${result.errorCount} errors`
            );
          }
        } catch (err) {
          console.error(`Error processing batch ${batchId}:`, err);
        }
      }
    } else {
      console.log("No processing batches found");
    }

    console.log("=== Batch Processor Cron Job Completed ===");

    return NextResponse.json({
      success: true,
      message: "Batch processing completed",
      submitted: submitResult,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Cron job failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}