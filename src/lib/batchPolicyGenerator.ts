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

export async function queuePolicyGeneration(
  userId: string,
  domain: string,
  jurisdiction: string,
  companyName?: string
) {
  const customId = `policy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const prompt = buildPolicyPrompt(domain, jurisdiction, companyName);

  const { data, error } = await supabase
    .from("batch_jobs")
    .insert({ user_id: userId, domain, jurisdiction, custom_id: customId, prompt, status: "pending" })
    .select()
    .single();

  if (error) throw new Error(`Failed to queue job: ${error.message}`);
  return { jobId: data.id, customId };
}

export async function submitBatchJobs() {
  const { data: pendingJobs, error: fetchError } = await supabase
    .from("batch_jobs").select("*").eq("status", "pending").limit(100);

  if (fetchError) throw fetchError;
  if (!pendingJobs || pendingJobs.length === 0) return { jobCount: 0, batchId: null };

  const requests = pendingJobs.map((job) => ({
    custom_id: job.custom_id,
    params: {
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: "You are a professional privacy lawyer specializing in GDPR and Swiss nDSG compliance.",
      messages: [{ role: "user" as const, content: job.prompt }],
    },
  }));

  const batch = await anthropic.beta.messages.batches.create({ requests });

  await supabase.from("batch_jobs")
    .update({ batch_id: batch.id, status: "processing", updated_at: new Date().toISOString() })
    .in("custom_id", pendingJobs.map((j) => j.custom_id));

  return { jobCount: pendingJobs.length, batchId: batch.id };
}

export async function processBatchResults() {
  const { data: processingJobs, error: fetchError } = await supabase
    .from("batch_jobs").select("*").eq("status", "processing").not("batch_id", "is", null).limit(100);

  if (fetchError) throw fetchError;
  if (!processingJobs || processingJobs.length === 0) return;

  for (const job of processingJobs) {
    try {
      const batch = await anthropic.beta.messages.batches.retrieve(job.batch_id);

      if (batch.processing_status === "ended") {
        const results = await anthropic.beta.messages.batches.results(job.batch_id);
        let policyContent = null;
        let inputTokens = 0;
        let outputTokens = 0;

        for await (const result of results) {
          if (result.custom_id === job.custom_id) {
            if (
              result.result.type === "succeeded" &&
              result.result.message.content[0].type === "text"
            ) {
              policyContent = result.result.message.content[0].text;
              inputTokens = result.result.message.usage.input_tokens;
              outputTokens = result.result.message.usage.output_tokens;
            }
            break;
          }
        }

        if (policyContent) {
          const costCents = Math.round(((inputTokens * 1.5 + outputTokens * 7.5) / 1000000) * 100);

          const { data: updatedJob } = await supabase.from("batch_jobs")
            .update({ status: "completed", policy_content: policyContent, input_tokens: inputTokens, output_tokens: outputTokens, cost_cents: costCents, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
            .eq("id", job.id).select("*, users:user_id(email)").single();

          if (updatedJob?.users) {
            try {
              await fetch("https://dataquard.ch/api/email/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "policy-ready", email: (updatedJob.users as { email: string }).email, domain: job.domain, policyContent: policyContent.substring(0, 200), jobId: job.id }),
              });
            } catch (emailError) {
              console.error("Failed to send email:", emailError);
            }
          }
        } else {
          await supabase.from("batch_jobs").update({ status: "failed", error_message: "No policy content generated", updated_at: new Date().toISOString() }).eq("id", job.id);
        }
      }
    } catch (jobError) {
      console.error(`Error processing job ${job.id}:`, jobError);
    }
  }
}

export async function getJobStatus(jobId: string, userId: string) {
  const { data, error } = await supabase.from("batch_jobs").select("*").eq("id", jobId).eq("user_id", userId).single();
  if (error) throw new Error("Job not found");
  return { status: data.status, domain: data.domain, jurisdiction: data.jurisdiction, policyContent: data.policy_content, completedAt: data.completed_at, costCents: data.cost_cents, errorMessage: data.error_message };
}

export async function getUserBatchJobs(userId: string) {
  const { data, error } = await supabase.from("batch_jobs").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(10);
  if (error) throw error;
  return data;
}

function buildPolicyPrompt(domain: string, jurisdiction: string, companyName?: string): string {
  const company = companyName || "Your Company";
  if (jurisdiction === "GDPR") {
    return `Generate a comprehensive GDPR-compliant Privacy Policy for ${company} at domain ${domain}. Include: Introduction, Data Controller, Legal Basis, Data Types, Cookies, Retention, User Rights, Contact. Format as Markdown.`;
  } else if (jurisdiction === "nDSG") {
    return `Generate a comprehensive nDSG (Swiss) compliant Privacy Policy for ${company} at domain ${domain}. Include: Introduction, Responsible Person, Legal Basis, Data Categories, Cookies, Security, Retention, Rights, Contact. Format as Markdown.`;
  } else {
    return `Generate a Privacy Policy for ${company} at domain ${domain} compliant with both GDPR and nDSG. Include all required sections for both jurisdictions. Format as Markdown.`;
  }
}

export default { queuePolicyGeneration, submitBatchJobs, processBatchResults, getJobStatus, getUserBatchJobs };