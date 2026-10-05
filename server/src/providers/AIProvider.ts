import type {
  AIOutput,
  CampaignInput,
  CampaignOutput,
  RegenerateTarget,
  RegeneratedValue,
} from "@campaign-ai/shared";

export interface CallOpts {
  signal?: AbortSignal;
  feedback?: string[];
}

export interface AIProvider {
  generateCampaign(input: CampaignInput, opts: CallOpts): Promise<AIOutput>;
  regenerateSection(
    input: CampaignInput,
    target: RegenerateTarget,
    current: CampaignOutput,
    opts: CallOpts
  ): Promise<RegeneratedValue>;
}
