import type {
  ApiResponse,
  CampaignInput,
  CampaignOutput,
  RegenerateRequest,
  RegeneratedValue,
} from "@campaign-ai/shared";

const apiBase = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const BASE_URL = `${apiBase}/api/v1`;

async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            response.status === 404
              ? "API route not found (404). If the frontend is deployed on Vercel, please ensure VITE_API_URL is configured."
              : `Server returned non-JSON response (${response.status} ${response.statusText}): ${text.slice(0, 120)}`,
        },
      };
    }

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (err: any) {
    const isNetworkError =
      err?.name === "TypeError" ||
      err?.message?.includes("Failed to fetch") ||
      err?.message?.includes("NetworkError");

    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: isNetworkError
          ? "Unable to connect to CampaignAI backend. Please verify the server is running."
          : (err?.message || "An unexpected network error occurred."),
      },
    };
  }
}

export async function generateCampaign(
  input: CampaignInput
): Promise<ApiResponse<CampaignOutput>> {
  return fetchApi<CampaignOutput>("/campaigns/generate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function regenerateSection(
  request: RegenerateRequest
): Promise<ApiResponse<RegeneratedValue>> {
  return fetchApi<RegeneratedValue>("/campaigns/regenerate", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/health`);
    if (!response.ok) return false;
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return false;
    const data = await response.json();
    return data?.status === "ok";
  } catch {
    return false;
  }
}
