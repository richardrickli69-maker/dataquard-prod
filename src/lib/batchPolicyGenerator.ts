// src/lib/batchPolicyGenerator.ts
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface BatchRequest {
  custom_id: string;
  params: {
    model: string;
    max_tokens: number;
    messages: Array<{
      role: "user" | "assistant";
      content: string;
    }>;
  };
}

function buildPolicyPrompt(
  domain: string,
  jurisdiction: "GDPR" | "nDSG" | "BOTH",
  companyName?: string
): string {
  const jurisdictionText =
    jurisdiction === "BOTH"
      ? "both GDPR (EU) and nDSG (Switzerland)"
      : jurisdiction === "GDPR"
        ? "GDPR (EU)"
        : "nDSG (Switzerland)";

  return `You are an expert data protection lawyer. Generate a comprehensive privacy policy for the following website:

Domain: ${domain}
Company Name: ${companyName || "Not specified"}
Applicable Regulations: ${jurisdictionText}

Requirements:
1. Professional, legal-ready format
2. Address specific ${jurisdictionText} requirements
3. Include sections: Data Collection, Use of Data, Cookies, Rights, Contact Info
4. Use clear, accessible language
5. Format as Markdown

Generate a complete, production-ready privacy policy:`;
}

export async function queuePolicyGeneration(
  userId: string,
  domain: string,
  jurisdiction: "GDPR" | "nDSG" | "BOTH",
  companyName?: string
) {
  const customId = `policy-${userId}-${domain}-${Date.now()}`;
  const prompt = buildPolicyPrompt(domain, jurisdiction, companyName);

  const { data, error } = await supabase
    .from("batch_jobs")
    .insert({
      user_id: userId,
      status: "pending",
      custom_id: customId,
      domain,
      jurisdiction,
      prompt,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    jobId: data.id,
    customId: customId,
    status: "queued",
  };
}

export async function submitBatchJobs() {
  const { data: pendingJobs, error } = await supabase
    .from("batch_jobs")
    .select("*")
    .eq("status", "pending")
    .limit(100000);

  if (error) throw error;
  if (!pendingJobs || pendingJobs.length === 0) {
    console.log("No pending batch jobs");
    return null;
  }

  console.log(`Submitting ${pendingJobs.length} batch jobs...`);

  const requests: BatchRequest[] = pendingJobs.map((job) => ({
    custom_id: job.custom_id,
    params: {
      model: "claude-sonnet-4-20250929",
      max_tokens: 2000,
      messages: [
        {
          role: "user" as const,
          content: job.prompt,
        },
      ],
    },
  }));

  const batch = await anthropic.beta.messages.batches.create({
    model: "claude-sonnet-4-20250929",
    requests: requests,
  });

  console.log(`Batch created: ${batch.id}`);

  await supabase
    .from("batch_jobs")
    .update({ batch_id: batch.id, status: "processing" })
    .in(
      "custom_id",
      pendingJobs.map((j) => j.custom_id)
    );

  return {
    batchId: batch.id,
    jobCount: pendingJobs.length,
    processingStatus: batch.processing_status,
  };
}

export async function processBatchResults(batchId: string) {
  const batch = await anthropic.beta.messages.batches.retrieve(batchId);

  console.log(`Batch ${batchId} status: ${batch.processing_status}`);

  if (batch.processing_status !== "ended") {
    return {
      batchId,
      status: batch.processing_status,
      processed: false,
    };
  }

  const results = await anthropic.beta.messages.batches.results(batchId);
  let successCount = 0;
  let errorCount = 0;

  for await (const result of results) {
    const { data: job, error: jobError } = await supabase
      .from("batch_jobs")
      .select("*")
      .eq("custom_id", result.custom_id)
      .single();

    if (jobError) {
      console.error(`Job not found: ${result.custom_id}`);
      errorCount++;
      continue;
    }

    if ("result" in result && result.result) {
      const message = result.result.message;
      const content = message.content[0];

      if (content && "text" in content) {
        const inputTokens = message.usage.input_tokens;
        const outputTokens = message.usage.output_tokens;
        const costCents = Math.round(
          (inputTokens * 1.5 + outputTokens * 7.5) / 1000000 * 100
        );

        await supabase
          .from("batch_jobs")
          .update({
            status: "completed",
            policy_content: content.text,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            cost_cents: costCents,
            completed_at: new Date(),
          })
          .eq("id", job.id);

        successCount++;
      }
    } else if ("error" in result && result.error) {
      await supabase
        .from("batch_jobs")
        .update({
          status: "failed",
          error_message: JSON.stringify(result.error),
        })
        .eq("id", job.id);

      errorCount++;
    }
  }

  console.log(
    `Batch ${batchId} completed: ${successCount} success, ${errorCount} errors`
  );

  return {
    batchId,
    status: "completed",
    processed: true,
    successCount,
    errorCount,
  };
}

export async function getJobStatus(jobId: string, userId: string) {
  const { data, error } = await supabase
    .from("batch_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    status: data.status,
    domain: data.domain,
    jurisdiction: data.jurisdiction,
    policyContent: data.policy_content,
    completedAt: data.completed_at,
    costCents: data.cost_cents,
  };
}

export async function getUserBatchJobs(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  const { data, error, count } = await supabase
    .from("batch_jobs")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return {
    jobs: data,
    total: count,
  };
}

export default {
  queuePolicyGeneration,
  submitBatchJobs,
  processBatchResults,
  getJobStatus,
  getUserBatchJobs,
}