import type {
  AIOutput,
  CampaignInput,
  CampaignOutput,
  RegenerateTarget,
  RegeneratedValue,
} from "@campaign-ai/shared";
import type { AIProvider, CallOpts } from "../AIProvider.js";

const MOCK_OUTPUT: AIOutput = {
  subjectLines: [
    "Run Farther, Feel Better with AirStride",
    "20% Off + Free Shipping on AirStride Shoes",
    "What If Your Shoes Could Keep Up With You?",
    "Weekend Sale Ends Soon — Don't Miss Out",
    "For Runners Who Refuse to Compromise",
  ],
  previewTexts: [
    "Lightweight comfort engineered for every stride",
    "Claim your 20% discount before the sale ends",
    "Discover why thousands of runners choose AirStride",
  ],
  promotionalEmail: {
    subject: "Your Weekend Running Goals Start Here",
    body: `Hey there,

Whether you're hitting the pavement at 6am or unwinding with an evening jog, you deserve shoes that work as hard as you do.

AirStride Running Shoes are engineered for lightweight comfort — designed for both running and walking, so they adapt to your day, not the other way around.

This weekend only: enjoy 20% off + free shipping on your order. No code needed.

Your best run is one step away.`,
    cta: "Shop AirStride Now — 20% Off",
  },
  whatsapp: {
    message:
      "Hey! 👟 Big weekend deal — AirStride Running Shoes are 20% off + free shipping right now. Lightweight, comfortable, and perfect for everyday runs. Grab yours before the sale ends!",
    cta: "Shop now → [link]",
  },
  sms: {
    message:
      "AirStride Sale: 20% Off + Free Shipping this weekend only. Lightweight running shoes built for daily comfort. Shop: [link]",
  },
};

export class MockProvider implements AIProvider {
  private callCount = 0;
  shouldFailOnce = false;

  async generateCampaign(
    _input: CampaignInput,
    _opts: CallOpts
  ): Promise<AIOutput> {
    await this.simulateDelay();

    if (this.shouldFailOnce && this.callCount === 0) {
      this.callCount++;
      throw new Error("Mock transient error");
    }

    this.callCount++;
    return structuredClone(MOCK_OUTPUT);
  }

  async regenerateSection(
    _input: CampaignInput,
    target: RegenerateTarget,
    _current: CampaignOutput,
    _opts: CallOpts
  ): Promise<RegeneratedValue> {
    await this.simulateDelay();

    switch (target.section) {
      case "subjectLine":
        return {
          section: "subjectLine",
          index: target.index,
          value: "Fresh Variation: Run Better, Feel Amazing",
        };
      case "previewText":
        return {
          section: "previewText",
          index: target.index,
          value: "New perspective on why AirStride stands out",
        };
      case "email":
        return {
          section: "email",
          value: {
            subject: "Your AirStride Awaits — Weekend Deal Inside",
            body: "Regenerated email body content for testing.",
            cta: "Get 20% Off Today",
          },
        };
      case "whatsapp":
        return {
          section: "whatsapp",
          value: {
            message: "Weekend flash sale! AirStride shoes — 20% off + free delivery. Limited time only.",
            cta: "Tap here to shop → [link]",
          },
        };
      case "sms": {
        const msg = "AirStride: 20% off ends Sunday. Free ship. Shop: [link]";
        return {
          section: "sms",
          value: { message: msg, characterCount: msg.length },
        };
      }
    }
  }

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
}
