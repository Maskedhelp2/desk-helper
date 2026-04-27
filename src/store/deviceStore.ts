import { create } from "zustand";
import { mockBackend } from "../mockBackend";

type Profile = {
  name: string;
  keymaps: string[][];
};

type DeviceState = {
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
  toggleConnection: () => void;

  currentLayer: number;
  layers: string[];
  setLayer: (layer: number) => void;

  keymaps: string[][];
  setKey: (index: number, value: string) => void;

  selectedKey: number | null;
  setSelectedKey: (index: number) => void;

  hoveredKey: number | null;
  setHoveredKey: (index: number | null) => void;

  macros: Macro[];
  selectedMacro: number | null;
  addMacro: () => void;
  deleteMacro: (id: number) => void;
  selectMacro: (id: number) => void;
  addStep: (step: MacroStep) => void;
  removeStep: (index: number) => void;

  hasUnsavedChanges: boolean;
  saveChanges: () => void;

  resetLayer: (layer: number) => void;

  // Profiles
  profiles: Profile[];
  currentProfile: string;
  createProfile: (name: string) => void;
  loadProfile: (name: string) => void;
  deleteProfile: (name: string) => void;

  exportProfile: () => void;
  importProfile: (data: Profile) => void;

  // Encoder
  encoder: {
    left: string;
    right: string;
    press: string;
  };
  setEncoder: (type: "left" | "right" | "press", value: string) => void;

  // OLED
  oled: {
    layout: {
      A: string;
      B: string;
      C: string;
    };
    logo: string | null;
    perProfile: boolean;
    effect: "static" | "pulse" | "scroll";
  };
  setOledLayout: (zone: "A" | "B" | "C", value: string) => void;
  setOledLogo: (data: string | null) => void;
  setOledProfileMode: (val: boolean) => void;
  setOledEffect: (effect: "static" | "pulse" | "scroll") => void;




};

type MacroStep =
  | { type: "key"; key: string }
  | { type: "delay"; ms: number };

type Macro = {
    id: number;
    name: string;
    steps: MacroStep[];
};



const STORAGE_KEY = "numpad-app-data";

/* 🔹 Load */
const loadData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/* 🔹 Save */
const saveData = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const saved = loadData();

export const useDeviceStore = create<DeviceState>((set, get) => ({
  /* DEVICE */
  connected: true,
  connect: () => set({ connected: true }),
  disconnect: () => set({ connected: false }),
  toggleConnection: () =>
    set((state) => ({ connected: !state.connected })),

  /* LAYERS */
  currentLayer: 0,
  layers: mockBackend.layers,
  setLayer: (layer) => set({ currentLayer: layer }),

  /* KEYMAPS */
  keymaps:
    saved?.keymaps || [
      Array(18).fill("KC_1"),
      Array(18).fill("KC_2"),
      Array(18).fill("KC_3"),
      Array(18).fill("KC_4"),
    ],

  setKey: (index, value) =>
    set((state) => {
      const newKeymaps = state.keymaps.map((layer, i) =>
        i === state.currentLayer
          ? layer.map((k, idx) => (idx === index ? value : k))
          : layer
      );

      const newState = {
        keymaps: newKeymaps,
        hasUnsavedChanges: true,
      };

      saveData({
        keymaps: newKeymaps,
        profiles: state.profiles,
        currentProfile: state.currentProfile,
      });

      return newState;
    }),

  /* SELECTION */
  selectedKey: null,
  setSelectedKey: (index) => set({ selectedKey: index }),

  hoveredKey: null,
  setHoveredKey: (index) => set({ hoveredKey: index }),

  macros: [],
  selectedMacro: null,
  addMacro: () =>
    set((state) => {
        const newMacro: Macro = {
            id: Date.now(),
            name: `Macro ${state.macros.length + 1}`,
            steps: [],
        };

        return {
            macros: [...state.macros, newMacro],
            selectedMacro: newMacro.id,
        };
    }),

    deleteMacro: (id) =>
        set((state) => ({
            macros: state.macros.filter((m) => m.id !== id),
            selectedMacro:
              state.selectedMacro === id ? null : state.selectedMacro,
        })),

    selectMacro: (id) =>
    set(() => ({
      selectedMacro: id,
    })),

    addStep: (step) =>
    set((state) => ({
      macros: state.macros.map((m) =>
        m.id === state.selectedMacro
          ? { ...m, steps: [...m.steps, step] }
          : m
      ),
    })),

    removeStep: (index) =>
    set((state) => ({
      macros: state.macros.map((m) =>
        m.id === state.selectedMacro
          ? {
              ...m,
              steps: m.steps.filter((_, i) => i !== index),
            }
          : m
      ),
    })),

  /* SAVE STATE */
  hasUnsavedChanges: false,

  saveChanges: () =>
    set((state) => {
      saveData({
        keymaps: state.keymaps,
        profiles: state.profiles,
        currentProfile: state.currentProfile,
      });

      return { hasUnsavedChanges: false };
    }),

  /* RESET LAYER */
  resetLayer: (layer) =>
    set((state) => {
      const newKeymaps = state.keymaps.map((l, i) =>
        i === layer ? Array(18).fill("KC_NO") : l
      );

      const newState = {
        keymaps: newKeymaps,
        hasUnsavedChanges: true,
      };

      saveData({
        keymaps: newKeymaps,
        profiles: state.profiles,
        currentProfile: state.currentProfile,
      });

      return newState;
    }),

  /* PROFILES */
  profiles:
    saved?.profiles || [
      {
        name: "Default",
        keymaps: [
          Array(18).fill("KC_1"),
          Array(18).fill("KC_2"),
          Array(18).fill("KC_3"),
          Array(18).fill("KC_4"),
        ],
      },
    ],

  currentProfile: saved?.currentProfile || "Default",

  createProfile: (name) =>
    set((state) => {
      const newProfiles = [
        ...state.profiles,
        { name, keymaps: state.keymaps },
      ];

      saveData({
        keymaps: state.keymaps,
        profiles: newProfiles,
        currentProfile: state.currentProfile,
      });

      return { profiles: newProfiles };
    }),

  loadProfile: (name) =>
    set((state) => {
      const profile = state.profiles.find((p) => p.name === name);
      if (!profile) return state;

      saveData({
        keymaps: profile.keymaps,
        profiles: state.profiles,
        currentProfile: name,
      });

      return {
        keymaps: profile.keymaps,
        currentProfile: name,
      };
    }),

  deleteProfile: (name) =>
    set((state) => {
      const newProfiles = state.profiles.filter((p) => p.name !== name);

      saveData({
        keymaps: state.keymaps,
        profiles: newProfiles,
        currentProfile: state.currentProfile,
      });

      return { profiles: newProfiles };
    }),

  /* EXPORT */
  exportProfile: () => {
    const state = get();
    const profile = state.profiles.find(
      (p) => p.name === state.currentProfile
    );
    if (!profile) return;

    const blob = new Blob([JSON.stringify(profile, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  /* IMPORT */
  importProfile: (data) =>
    set((state) => {
      const newProfiles = [...state.profiles, data];

      saveData({
        keymaps: state.keymaps,
        profiles: newProfiles,
        currentProfile: state.currentProfile,
      });

      return { profiles: newProfiles };
    }),

  /* ENCODER */
  encoder: {
    left: "KC_VOLU",
    right: "KC_VOLD",
    press: "KC_MUTE",
  },

  setEncoder: (type, value) =>
    set((state) => ({
      encoder: {
        ...state.encoder,
        [type]: value,
      },
      hasUnsavedChanges: true,
    })),

  

  /* OLED */
  oled: {
    layout: {
      A: "Layer",
      B: "Profile",
      C: "Custom",
    },
    logo: null,
    perProfile: false,
    effect: "static",
  },

  setOledLayout: (zone, value) =>
    set((state) => ({
      oled: {
        ...state.oled,
        layout: {
          ...state.oled.layout,
          [zone]: value,
        },
      },
      hasUnsavedChanges: true,
    })),

  setOledLogo: (data) =>
    set((state) => ({
      oled: {
        ...state.oled,
        logo: data,
      },
    })),

  setOledProfileMode: (val) =>
    set((state) => ({
      oled: {
        ...state.oled,
        perProfile: val,
      },
    })),

  setOledEffect: (effect) =>
    set((state) => ({
        oled: {
            ...state.oled,
            effect,
        },
    })),
}));