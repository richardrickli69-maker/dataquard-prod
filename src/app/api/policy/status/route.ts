// src/app/api/policy/status/[jobId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getJobStatus } from "@/lib/batchPolicyGenerator";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const jobStatus = await getJobStatus(jobId, session.user.id);

    return NextResponse.json({
      success: true,
      data: jobStatus,
    });
  } catch (error) {
    console.error("Error getting job status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get job status",
      },
      { status: 500 }
    );
  }
}