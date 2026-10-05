import { useState, useCallback, useRef } from "react";
import type {
  CampaignInput,
  CampaignOutput,
  CampaignConstraints,
  RegenerateTarget,
  RegeneratedValue,
} from "@campaign-ai/shared";
import { CampaignInputSchema } from "@campaign-ai/shared";
import type { HistoryItem } from "../components/common/CampaignHistoryModal.js";
import {
  generateCampaign,
  regenerateSection,
} from "../services/api.js";

type Status = "idle" | "loading" | "success" | "error";

type RegeneratingKey = string;

function makeRegenKey(target: RegenerateTarget): RegeneratingKey {
  if (target.section === "subjectLine" || target.section === "previewText") {
    return `${target.section}:${target.index}`;
  }
  return target.section;
}

const HISTORY_STORAGE_KEY = "campaign_ai_history_v1";

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, 25)));
  } catch {
    // Ignore storage errors
  }
}

export interface CampaignState {
  form: Partial<CampaignInput>;
  status: Status;
  result: CampaignOutput | null;
  submittedInput: CampaignInput | null;
  error: string | null;
  fieldErrors: Record<string, string>;
  regenerating: Set<RegeneratingKey>;
  regenErrors: Record<RegeneratingKey, string>;
  isStale: boolean;
  history: HistoryItem[];
}

export function useCampaign() {
  const [state, setState] = useState<CampaignState>(() => ({
    form: {},
    status: "idle",
    result: null,
    submittedInput: null,
    error: null,
    fieldErrors: {},
    regenerating: new Set(),
    regenErrors: {},
    isStale: false,
    history: loadHistory(),
  }));

  const resultRef = useRef<CampaignOutput | null>(null);
  const submittedInputRef = useRef<CampaignInput | null>(null);

  const updateForm = useCallback(
    (field: keyof CampaignInput, value: string) => {
      setState((prev) => {
        const newForm = { ...prev.form, [field]: value };
        // Check staleness
        const isStale =
          prev.submittedInput !== null &&
          JSON.stringify(newForm) !== JSON.stringify(prev.submittedInput);
        return {
          ...prev,
          form: newForm,
          isStale,
          fieldErrors: { ...prev.fieldErrors, [field]: "" },
        };
      });
    },
    []
  );

  const updateConstraints = useCallback(
    (partial: Partial<CampaignConstraints>) => {
      setState((prev) => {
        const prevConstraints = (prev.form.constraints as CampaignConstraints | undefined) ?? {};
        const newConstraints = { ...prevConstraints, ...partial };
        const newForm = { ...prev.form, constraints: newConstraints };
        const isStale =
          prev.submittedInput !== null &&
          JSON.stringify(newForm) !== JSON.stringify(prev.submittedInput);
        return { ...prev, form: newForm, isStale };
      });
    },
    []
  );

  const fillExample = useCallback(() => {
    const example: CampaignInput = {
      productName: "AirStride Running Shoes",
      productDescription:
        "AirStride Running Shoes are lightweight everyday running shoes designed for men and women who want comfort and style. Built with breathable mesh upper, cushioned midsole, and durable rubber outsole — perfect for daily runs and casual walks.",
      offer: "20% Off + Free Shipping",
      targetAudience:
        "Men and women aged 20–40 who are looking for comfortable running and walking shoes.",
      campaignObjective: "Drive purchases during the weekend sale.",
      tone: "Energetic",
      constraints: {
        emailLength: "standard",
        smsLimit: 160,
        emojiStyle: "balanced",
        language: "English",
      },
    };
    setState((prev) => ({
      ...prev,
      form: example,
      fieldErrors: {},
      isStale:
        prev.submittedInput !== null &&
        JSON.stringify(example) !== JSON.stringify(prev.submittedInput),
    }));
  }, []);

  const generate = useCallback(
    async (rawInput?: Partial<CampaignInput>) => {
      const candidate = rawInput ?? state.form;
      const validation = CampaignInputSchema.safeParse(candidate);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of validation.error.issues) {
          const fieldName = issue.path[0];
          if (typeof fieldName === "string" && !fieldErrors[fieldName]) {
            fieldErrors[fieldName] = issue.message;
          }
        }
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Please complete all required fields correctly before generating.",
          fieldErrors,
        }));
        return false;
      }

      const input = validation.data;
      setState((prev) => ({
        ...prev,
        status: "loading",
        error: null,
        fieldErrors: {},
      }));

      try {
        const response = await generateCampaign(input);

        if (response.success) {
          resultRef.current = response.data;
          submittedInputRef.current = input;

          const newHistoryItem: HistoryItem = {
            id:
              typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : String(Date.now()),
            timestamp: Date.now(),
            input,
            output: response.data,
          };

          setState((prev) => {
            const updatedHistory = [newHistoryItem, ...prev.history.slice(0, 24)];
            saveHistory(updatedHistory);
            return {
              ...prev,
              status: "success",
              result: response.data,
              submittedInput: input,
              error: null,
              isStale: false,
              history: updatedHistory,
            };
          });
          return true;
        } else {
          const err = response.error;
          const fieldErrors: Record<string, string> = {};

          if (err.details) {
            for (const detail of err.details) {
              if (detail.field) {
                fieldErrors[detail.field] = detail.message;
              }
            }
          }

          setState((prev) => ({
            ...prev,
            status: "error",
            error: err.message,
            fieldErrors,
          }));
          return false;
        }
      } catch (unexpected: any) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: unexpected?.message || "An unexpected error occurred during generation.",
          fieldErrors: {},
        }));
        return false;
      }
    },
    [state.form]
  );

  const restoreCampaign = useCallback((item: HistoryItem) => {
    resultRef.current = item.output;
    submittedInputRef.current = item.input;
    setState((prev) => ({
      ...prev,
      form: { ...item.input },
      result: item.output,
      submittedInput: item.input,
      status: "success",
      isStale: false,
      fieldErrors: {},
      error: null,
    }));
  }, []);

  const deleteHistoryItem = useCallback((id: string) => {
    setState((prev) => {
      const updated = prev.history.filter((h) => h.id !== id);
      saveHistory(updated);
      return { ...prev, history: updated };
    });
  }, []);

  const clearHistory = useCallback(() => {
    saveHistory([]);
    setState((prev) => ({ ...prev, history: [] }));
  }, []);

  const regenerate = useCallback(
    async (target: RegenerateTarget) => {
      const current = resultRef.current;
      const campaignInput = submittedInputRef.current;

      if (!current || !campaignInput) return;

      const key = makeRegenKey(target);

      setState((prev) => {
        const newRegenerating = new Set(prev.regenerating);
        newRegenerating.add(key);
        const newRegenErrors = { ...prev.regenErrors };
        delete newRegenErrors[key];
        return { ...prev, regenerating: newRegenerating, regenErrors: newRegenErrors };
      });

      try {
        const response = await regenerateSection({
          campaign: campaignInput,
          target,
          current,
        });

        if (response.success) {
          const value = response.data as RegeneratedValue;
          const updated = applyRegeneratedValue(current, value);
          resultRef.current = updated;

          setState((prev) => {
            const newRegenerating = new Set(prev.regenerating);
            newRegenerating.delete(key);
            return {
              ...prev,
              result: updated,
              regenerating: newRegenerating,
            };
          });
        } else {
          setState((prev) => {
            const newRegenerating = new Set(prev.regenerating);
            newRegenerating.delete(key);
            return {
              ...prev,
              regenerating: newRegenerating,
              regenErrors: { ...prev.regenErrors, [key]: response.error.message },
            };
          });
        }
      } catch (err: any) {
        setState((prev) => {
          const newRegenerating = new Set(prev.regenerating);
          newRegenerating.delete(key);
          return {
            ...prev,
            regenerating: newRegenerating,
            regenErrors: {
              ...prev.regenErrors,
              [key]: err?.message || "Failed to regenerate section.",
            },
          };
        });
      }
    },
    []
  );

  return {
    state,
    updateForm,
    updateConstraints,
    fillExample,
    generate,
    regenerate,
    restoreCampaign,
    deleteHistoryItem,
    clearHistory,
  };
}

function applyRegeneratedValue(
  current: CampaignOutput,
  value: RegeneratedValue
): CampaignOutput {
  const updated = structuredClone(current);

  switch (value.section) {
    case "subjectLine":
      updated.subjectLines[value.index] = value.value;
      break;
    case "previewText":
      updated.previewTexts[value.index] = value.value;
      break;
    case "email":
      updated.promotionalEmail = value.value;
      break;
    case "whatsapp":
      updated.whatsapp = value.value;
      break;
    case "sms":
      updated.sms = value.value;
      break;
  }

  return updated;
}
