"use client";

import * as React from "react";
import { create } from "zustand";
import { defaultRuleForm, type RuleForm } from "./rule-dialog";

type StoreState = {
  scope: "center" | "field";
  selectedField: string;
  quoteField: string;
  quoteDate: string;
  quoteDatePickerOpen: boolean;
  startTime: string;
  endTime: string;
  overrideScope: "center" | "field";
  overrideField: string;
  overrideStatus: "BLOCK" | "OPEN";
  overrideStart: string;
  overrideEnd: string;
  overrideReason: string;
  editingOverrideId: string | null;
  ruleDialogOpen: boolean;
  ruleForm: RuleForm;
  viewMode: "edit" | "preview";
};

type StoreActions = {
  setScope: (value: "center" | "field") => void;
  setSelectedField: (value: string) => void;
  setQuoteField: (value: string) => void;
  setQuoteDate: (value: string) => void;
  setQuoteDatePickerOpen: (open: boolean) => void;
  setStartTime: (value: string) => void;
  setEndTime: (value: string) => void;
  setOverrideScope: (value: "center" | "field") => void;
  setOverrideField: (value: string) => void;
  setOverrideStatus: (value: "BLOCK" | "OPEN") => void;
  setOverrideStart: (value: string) => void;
  setOverrideEnd: (value: string) => void;
  setOverrideReason: (value: string) => void;
  setEditingOverrideId: (id: string | null) => void;
  setRuleDialogOpen: (open: boolean) => void;
  setRuleForm: React.Dispatch<React.SetStateAction<RuleForm>>;
  resetRuleForm: () => void;
  setViewMode: (mode: "edit" | "preview") => void;
  reset: () => void;
};

type PriceAvailabilityStore = StoreState & StoreActions;

const initialState = (): StoreState => ({
  scope: "center",
  selectedField: "",
  quoteField: "",
  quoteDate: new Date().toISOString().slice(0, 10),
  quoteDatePickerOpen: false,
  startTime: "09:00",
  endTime: "11:30",
  overrideScope: "center",
  overrideField: "",
  overrideStatus: "BLOCK",
  overrideStart: "",
  overrideEnd: "",
  overrideReason: "",
  editingOverrideId: null,
  ruleDialogOpen: false,
  ruleForm: defaultRuleForm,
  viewMode: "edit",
});

export const usePriceAvailabilityStore = create<PriceAvailabilityStore>((set) => ({
  ...initialState(),
  setScope: (value) => set({ scope: value }),
  setSelectedField: (value) => set({ selectedField: value }),
  setQuoteField: (value) => set({ quoteField: value }),
  setQuoteDate: (value) => set({ quoteDate: value }),
  setQuoteDatePickerOpen: (open) => set({ quoteDatePickerOpen: open }),
  setStartTime: (value) => set({ startTime: value }),
  setEndTime: (value) => set({ endTime: value }),
  setOverrideScope: (value) => set({ overrideScope: value }),
  setOverrideField: (value) => set({ overrideField: value }),
  setOverrideStatus: (value) => set({ overrideStatus: value }),
  setOverrideStart: (value) => set({ overrideStart: value }),
  setOverrideEnd: (value) => set({ overrideEnd: value }),
  setOverrideReason: (value) => set({ overrideReason: value }),
  setEditingOverrideId: (id) => set({ editingOverrideId: id }),
  setRuleDialogOpen: (open) => set({ ruleDialogOpen: open }),
  setRuleForm: (updater) =>
    set((state) => ({
      ruleForm: typeof updater === "function" ? updater(state.ruleForm) : updater,
    })),
  resetRuleForm: () => set({ ruleForm: defaultRuleForm }),
  setViewMode: (mode) => set({ viewMode: mode }),
  reset: () => set(initialState()),
}));

