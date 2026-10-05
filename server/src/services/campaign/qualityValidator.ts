import type { AIOutput, CampaignConstraints, CampaignOutput } from "@campaign-ai/shared";

export interface QualityError {
  field: string;
  message: string;
}

const PLACEHOLDER_PATTERN = /\[[\w\s]+\]|\{\{[\w\s]+\}\}|lorem/i;

export function validateQuality(output: AIOutput, constraints?: CampaignConstraints): QualityError[] {
  const errors: QualityError[] = [];
  const maxSms = constraints?.smsLimit ?? 160;
  const minEmailWords = constraints?.emailLength === "short" ? 25 : constraints?.emailLength === "detailed" ? 75 : 40;

  // ─── Subject Lines ─────────────────────────────────────────────────────────
  output.subjectLines.forEach((line, i) => {
    if (!line.trim()) {
      errors.push({ field: `subjectLines[${i}]`, message: "Empty or whitespace-only" });
    }
    if (PLACEHOLDER_PATTERN.test(line)) {
      errors.push({ field: `subjectLines[${i}]`, message: `Contains placeholder: "${line}"` });
    }
    if (line.length > 80) {
      errors.push({
        field: `subjectLines[${i}]`,
        message: `Subject line too long: ${line.length} chars (max 80)`,
      });
    }
  });

  // Duplicates within subject lines
  const normalizedSubjects = output.subjectLines.map((s) => s.trim().toLowerCase());
  const subjectSet = new Set<string>();
  normalizedSubjects.forEach((s, i) => {
    if (subjectSet.has(s)) {
      errors.push({
        field: `subjectLines[${i}]`,
        message: `Duplicate subject line: "${output.subjectLines[i]}"`,
      });
    }
    subjectSet.add(s);
  });

  // ─── Preview Texts ─────────────────────────────────────────────────────────
  output.previewTexts.forEach((text, i) => {
    if (!text.trim()) {
      errors.push({ field: `previewTexts[${i}]`, message: "Empty or whitespace-only" });
    }
    if (PLACEHOLDER_PATTERN.test(text)) {
      errors.push({ field: `previewTexts[${i}]`, message: `Contains placeholder: "${text}"` });
    }
    if (text.length > 140) {
      errors.push({
        field: `previewTexts[${i}]`,
        message: `Preview text too long: ${text.length} chars (max 140)`,
      });
    }
  });

  // Duplicates within preview texts
  const normalizedPreviews = output.previewTexts.map((p) => p.trim().toLowerCase());
  const previewSet = new Set<string>();
  normalizedPreviews.forEach((p, i) => {
    if (previewSet.has(p)) {
      errors.push({
        field: `previewTexts[${i}]`,
        message: `Duplicate preview text: "${output.previewTexts[i]}"`,
      });
    }
    previewSet.add(p);
  });

  // ─── Promotional Email ─────────────────────────────────────────────────────
  const { promotionalEmail } = output;
  if (!promotionalEmail.subject.trim()) {
    errors.push({ field: "promotionalEmail.subject", message: "Email subject is empty" });
  }
  if (PLACEHOLDER_PATTERN.test(promotionalEmail.subject)) {
    errors.push({ field: "promotionalEmail.subject", message: "Email subject contains placeholder" });
  }
  if (!promotionalEmail.body.trim()) {
    errors.push({ field: "promotionalEmail.body", message: "Email body is empty" });
  }
  const emailWords = promotionalEmail.body.trim().split(/\s+/).length;
  if (emailWords < minEmailWords) {
    errors.push({
      field: "promotionalEmail.body",
      message: `Email body too short. Got approximately ${emailWords} words (min ${minEmailWords}).`,
    });
  }
  if (!promotionalEmail.cta.trim()) {
    errors.push({ field: "promotionalEmail.cta", message: "Email CTA is empty or missing" });
  }
  if (PLACEHOLDER_PATTERN.test(promotionalEmail.body)) {
    errors.push({ field: "promotionalEmail.body", message: "Email body contains placeholder" });
  }

  // ─── WhatsApp ──────────────────────────────────────────────────────────────
  if (!output.whatsapp.message.trim()) {
    errors.push({ field: "whatsapp.message", message: "WhatsApp message is empty" });
  }
  if (output.whatsapp.message.length > 700) {
    errors.push({
      field: "whatsapp.message",
      message: `WhatsApp message too long: ${output.whatsapp.message.length} chars (max 700)`,
    });
  }
  if (PLACEHOLDER_PATTERN.test(output.whatsapp.message)) {
    errors.push({ field: "whatsapp.message", message: "WhatsApp message contains placeholder" });
  }

  // ─── SMS ───────────────────────────────────────────────────────────────────
  if (!output.sms.message.trim()) {
    errors.push({ field: "sms.message", message: "SMS message is empty" });
  }
  if (output.sms.message.length > maxSms) {
    errors.push({
      field: "sms.message",
      message: `SMS message too long: ${output.sms.message.length} chars (max ${maxSms}). Do not truncate.`,
    });
  }
  if (PLACEHOLDER_PATTERN.test(output.sms.message)) {
    errors.push({ field: "sms.message", message: "SMS message contains placeholder" });
  }

  return errors;
}

export function computeSmsCharacterCount(output: AIOutput): CampaignOutput {
  return {
    ...output,
    sms: {
      message: output.sms.message,
      characterCount: output.sms.message.length,
    },
  };
}
