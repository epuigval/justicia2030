import { createHash } from "node:crypto";
import { Resend } from "resend";
import { createPhaseResultEmail, type ValidatedPhaseResult } from "@/domain/workshop-email";

export interface PhaseResultEmailConfig {
  apiKey: string;
  from: string;
  to: string[];
  replyTo?: string;
}

export function readPhaseResultEmailConfig(environment: NodeJS.ProcessEnv = process.env): PhaseResultEmailConfig | null {
  const apiKey = environment.RESEND_API_KEY?.trim();
  const from = environment.RESEND_FROM_EMAIL?.trim();
  const to = environment.RESULTS_EMAIL_TO?.split(",").map((address) => address.trim()).filter(Boolean) ?? [];
  const replyTo = environment.RESULTS_REPLY_TO?.trim();

  if (!apiKey || !from || to.length === 0) return null;
  return { apiKey, from, to, ...(replyTo ? { replyTo } : {}) };
}

export function createPhaseResultIdempotencyKey(result: ValidatedPhaseResult): string {
  const fingerprint = createHash("sha256")
    .update(JSON.stringify([result.sessionId, result.phaseId, result.selectedCardIds]))
    .digest("hex");
  return `justicia2030-phase-result-${fingerprint}`;
}

export async function sendPhaseResultEmail(config: PhaseResultEmailConfig, result: ValidatedPhaseResult): Promise<boolean> {
  const email = createPhaseResultEmail(result);
  const resend = new Resend(config.apiKey);
  const response = await resend.emails.send(
    {
      from: config.from,
      to: config.to,
      subject: email.subject,
      text: email.text,
      ...(config.replyTo ? { replyTo: config.replyTo } : {}),
    },
    { idempotencyKey: createPhaseResultIdempotencyKey(result) },
  );

  return response.error === null;
}
