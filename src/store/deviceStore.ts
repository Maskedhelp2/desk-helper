import { create } from "zustand";
import { mockBackend } from "../mockBackend";

type DeviceState = {
  connected: boolean;
  currentLayer: number;
  layers: string[];
  keymaps: string[][];

  selectedKey: number | null;
  setSelectedKey: (index: number) => void;

  setKey: (index: number, value: string) => void;

  setLayer: (layer: number) => void;

  hasUnsavedChanges: boolean;
  setUnsavedChanges: (value: boolean) => void;
  saveChanges: () => void;
};

export const useDeviceStore = create<DeviceState>((set) => ({
  connected: mockBackend.connected,
  currentLayer: 0,
  layers: mockBackend.layers,

  keymaps: [
    Array(17).fill("KC_1"),
    Array(17).fill("KC_2"),
    Array(17).fill("KC_3"),
    Array(17).fill("KC_4"),
  ],

  selectedKey: null,

  setSelectedKey: (index) => set({ selectedKey: index }),

  setKey: (index, value) =>
    set((state) => {
      const newKeymaps = [...state.keymaps];

      const layerCopy = [...newKeymaps[state.currentLayer]];
      layerCopy[index] = value;

      newKeymaps[state.currentLayer] = layerCopy;

      return {
        keymaps: newKeymaps,
        hasUnsavedChanges: true,
      };
    }),

  setLayer: (layer) => set({ currentLayer: layer }),

  hasUnsavedChanges: false,

  setUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),

  saveChanges: () =>
    set(() => ({
      hasUnsavedChanges: false,
    })),
}));