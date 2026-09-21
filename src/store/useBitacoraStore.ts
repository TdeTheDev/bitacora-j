import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BitacoraData } from "../lib/types";
import { defaultBitacoraData } from "../lib/types";

interface BitacoraStore {
  data: BitacoraData;
  setData: (data: BitacoraData) => void;
  resetData: () => void;
}

export const useBitacoraStore = create<BitacoraStore>()(
  persist(
    (set) => ({
      data: { ...defaultBitacoraData },
      setData: (data) => set({ data }),
      resetData: () => set({ data: { ...defaultBitacoraData } }),
    }),
    {
      name: "bitacora-pepina-storage",
      merge: (persisted, current) => {
        const old = persisted as Record<string, unknown> | null;
        if (old && !old.imagenes) {
          return { ...current, ...old, imagenes: [] };
        }
        return { ...current, ...old };
      },
    },
  ),
);
