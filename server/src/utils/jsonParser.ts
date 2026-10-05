import { AIResponseInvalidError } from "./retry.js";

/**
 * Robustly parses JSON returned by an LLM.
 * Handles:
 * - Markdown fences (```json ... ``` or ``` ... ```)
 * - Leading / trailing non-JSON commentary
 * - Unescaped raw newlines (0x0A) or carriage returns (0x0D) inside string literals
 * - Unescaped control characters (ASCII < 32)
 * - Trailing commas before } or ]
 */
export function cleanAndParseJson<T = any>(raw: string): T {
  if (!raw || typeof raw !== "string") {
    throw new AIResponseInvalidError("Empty response from AI provider");
  }

  // 1. Strip markdown fences if present
  let text = raw.trim();
  const fenceMatch = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // 2. Extract content between first { and last }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  // 3. Try native JSON.parse first (fast path)
  try {
    return JSON.parse(text);
  } catch {
    // Continue to sanitization
  }

  // 4. Sanitize raw newlines and control characters inside string literals
  let inString = false;
  let isEscaped = false;
  let sanitized = "";

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (isEscaped) {
        sanitized += char;
        isEscaped = false;
      } else if (char === "\\") {
        sanitized += char;
        isEscaped = true;
      } else if (char === '"') {
        sanitized += char;
        inString = false;
      } else if (char === "\n") {
        sanitized += "\\n";
      } else if (char === "\r") {
        sanitized += "\\r";
      } else if (char === "\t") {
        sanitized += "\\t";
      } else if (char.charCodeAt(0) < 32) {
        sanitized += "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0");
      } else {
        sanitized += char;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      sanitized += char;
    }
  }

  // 5. Try parsing sanitized string
  try {
    return JSON.parse(sanitized);
  } catch {
    // Continue to trailing comma removal
  }

  // 6. Handle trailing commas before } or ]
  const withoutTrailingCommas = sanitized.replace(/,(\s*[}\]])/g, "$1");
  try {
    return JSON.parse(withoutTrailingCommas);
  } catch (finalErr: any) {
    console.error("Failed to parse AI response. Raw preview:", text.slice(0, 300));
    throw new AIResponseInvalidError(
      `AI returned invalid JSON: ${finalErr?.message || "Syntax error"}`
    );
  }
}
