import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BitacoraData } from "../lib/types";
import { defaultBitacoraData } from "../lib/types";

interface BitacoraStore {
  data: BitacoraData;
  isDirty: boolean;
  setData: (data: BitacoraData) => void;
  resetData: () => void;
}

export const useBitacoraStore = create<BitacoraStore>()(
  persist(
    (set) => ({
      data: { ...defaultBitacoraData },
      isDirty: false,
      setData: (data) => set({ data, isDirty: true }),
      resetData: () => set({ data: { ...defaultBitacoraData }, isDirty: false }),
    }),
    {
      name: "bitacora-pepina-storage",
    },
  ),
);
