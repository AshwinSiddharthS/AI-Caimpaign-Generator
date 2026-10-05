import type { CampaignInput, CampaignOutput } from "@campaign-ai/shared";

export function exportPDF(input: CampaignInput, output: CampaignOutput): void {
  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to export campaign copy as PDF.");
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Campaign Copy — ${input.productName}</title>
  <style>
    @page {
      margin: 15mm 20mm;
      size: A4 portrait;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      padding: 0;
      margin: 0;
      font-size: 13px;
    }
    .header {
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: #1e1b4b;
    }
    .header .meta {
      font-size: 12px;
      color: #64748b;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      background: #e0e7ff;
      color: #3730a3;
      margin-right: 6px;
    }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .card-title {
      font-size: 14px;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 0;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      font-size: 12px;
    }
    .details-table td {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
    }
    .details-table td.label {
      font-weight: 600;
      width: 25%;
      background: #f8fafc;
      color: #475569;
    }
    ol, ul {
      margin: 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 6px;
    }
    .email-box {
      background: #f8fafc;
      border-left: 3px solid #6366f1;
      padding: 12px 14px;
      border-radius: 4px;
      white-space: pre-wrap;
      font-family: inherit;
      margin: 8px 0;
    }
    .cta-badge {
      display: inline-block;
      margin-top: 8px;
      font-weight: 600;
      color: #4338ca;
    }
    .whatsapp-box {
      background: #f0fdf4;
      border-left: 3px solid #22c55e;
      padding: 12px 14px;
      border-radius: 4px;
    }
    .sms-box {
      background: #faf5ff;
      border-left: 3px solid #a855f7;
      padding: 12px 14px;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .footer {
      margin-top: 24px;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      font-size: 11px;
      color: #94a3b8;
      text-align: right;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>CampaignAI — Marketing Copy Brief</h1>
      <div style="margin-top: 4px;">
        <span class="badge">${input.productName}</span>
        <span class="badge">${input.tone} Tone</span>
        <span class="badge">${input.offer}</span>
      </div>
    </div>
    <div class="meta">Exported ${date}</div>
  </div>

  <table class="details-table">
    <tr>
      <td class="label">Product Name</td>
      <td>${input.productName}</td>
    </tr>
    <tr>
      <td class="label">Offer / Discount</td>
      <td><strong>${input.offer}</strong></td>
    </tr>
    <tr>
      <td class="label">Target Audience</td>
      <td>${input.targetAudience}</td>
    </tr>
    <tr>
      <td class="label">Campaign Objective</td>
      <td>${input.campaignObjective}</td>
    </tr>
    <tr>
      <td class="label">Product Description</td>
      <td>${input.productDescription}</td>
    </tr>
  </table>

  <div class="card">
    <div class="card-title">
      <span>1. Email Subject Lines (5 Variations)</span>
    </div>
    <ol>
      ${output.subjectLines.map((s) => `<li>${s}</li>`).join("")}
    </ol>
  </div>

  <div class="card">
    <div class="card-title">
      <span>2. Email Preview Texts (3 Variations)</span>
    </div>
    <ol>
      ${output.previewTexts.map((p) => `<li>${p}</li>`).join("")}
    </ol>
  </div>

  <div class="card">
    <div class="card-title">
      <span>3. Promotional Email</span>
    </div>
    <p><strong>Subject:</strong> ${output.promotionalEmail.subject}</p>
    <div class="email-box">${output.promotionalEmail.body}</div>
    <div class="cta-badge">Primary CTA: ${output.promotionalEmail.cta}</div>
  </div>

  <div class="card">
    <div class="card-title">
      <span>4. WhatsApp Message</span>
    </div>
    <div class="whatsapp-box">
      <p style="margin: 0 0 8px 0;">${output.whatsapp.message}</p>
      <div style="font-weight: 600; color: #15803d;">CTA: ${output.whatsapp.cta}</div>
    </div>
  </div>

  <div class="card">
    <div class="card-title">
      <span>5. SMS Message (${output.sms.characterCount}/160 Chars)</span>
    </div>
    <div class="sms-box">
      <span>${output.sms.message}</span>
      <span style="font-size: 11px; font-weight: 700; color: #7e22ce; margin-left: 12px; white-space: nowrap;">
        ${output.sms.characterCount}/160
      </span>
    </div>
  </div>

  <div class="footer">
    Generated with CampaignAI • Powered by Google Gemini 3.5 Flash
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
