import type {
  ApiResponse,
  CampaignInput,
  CampaignOutput,
  RegenerateRequest,
  RegeneratedValue,
} from "@campaign-ai/shared";

const BASE_URL = "/api/v1";

async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();
    return data as ApiResponse<T>;
  } catch (err: any) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: err?.message?.includes("Failed to fetch")
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
    const data = await response.json();
    return data?.status === "ok";
  } catch {
    return false;
  }
}
