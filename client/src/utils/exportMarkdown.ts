import type { CampaignInput, CampaignOutput } from "@campaign-ai/shared";

export function exportMarkdown(
  input: CampaignInput,
  output: CampaignOutput
): void {
  const date = new Date().toISOString().split("T")[0];
  const slug = input.productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const content = `# Campaign Copy — ${input.productName}

**Generated:** ${date}

---

## Campaign Details

| Field | Value |
|---|---|
| **Product** | ${input.productName} |
| **Offer** | ${input.offer} |
| **Audience** | ${input.targetAudience} |
| **Objective** | ${input.campaignObjective} |
| **Tone** | ${input.tone} |

---

## Email Subject Lines

${output.subjectLines.map((s, i) => `${i + 1}. ${s}`).join("\n")}

## Preview Texts

${output.previewTexts.map((p, i) => `${i + 1}. ${p}`).join("\n")}

---

## Promotional Email

**Subject:** ${output.promotionalEmail.subject}

${output.promotionalEmail.body}

**CTA:** ${output.promotionalEmail.cta}

---

## WhatsApp Message

${output.whatsapp.message}

**CTA:** ${output.whatsapp.cta}

---

## SMS Message (${output.sms.characterCount}/160 characters)

${output.sms.message}
`;

  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `campaign-${slug}-${date}.md`;
  link.click();
  URL.revokeObjectURL(url);
}
