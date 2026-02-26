// src/app/api/policy/queue/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { queuePolicyGeneration } from "@/lib/batchPolicyGenerator";

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header (Bearer token)
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Create authenticated Supabase client with token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Verify the token by getting user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { domain, jurisdiction, companyName } = body;

    // Validation
    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid domain" },
        { status: 400 }
      );
    }

    if (!jurisdiction || !["GDPR", "nDSG", "BOTH"].includes(jurisdiction)) {
      return NextResponse.json(
        { success: false, error: "Invalid jurisdiction" },
        { status: 400 }
      );
    }

    // Queue the policy generation
    const result = await queuePolicyGeneration(
      user.id,
      domain,
      jurisdiction,
      companyName
    );

    return NextResponse.json({
      success: true,
      data: result,
      message:
        "Policy generation queued. You will receive an email when it is ready.",
    });
  } catch (error) {
    console.error("Error queueing policy:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to queue policy generation",
      },
      { status: 500 }
    );
  }
}