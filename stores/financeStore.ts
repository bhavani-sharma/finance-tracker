// stores/financeStore.ts
import { create } from "zustand";
import { Message } from "../types";

interface FinanceStore {
  selectedMonth: string;
  setMonth: (month: string) => void;
  aiMessages: Message[];
  appendMessage: (msg: Message) => void;
  clearChat: () => void;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  selectedMonth: new Date().toISOString().slice(0, 7),
  setMonth: (month) => set({ selectedMonth: month }),
  aiMessages: [],
  appendMessage: (msg) => set((s) => ({ aiMessages: [...s.aiMessages, msg] })),
  clearChat: () => set({ aiMessages: [] }),
}));
