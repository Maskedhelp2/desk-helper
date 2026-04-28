import { create } from "zustand";

/* TYPES */
export type Profile = {
  id: string;
  name: string;
  keymaps: string[][];
};

type MacroStep =
  | { type: "key"; key: string }
  | { type: "keydown"; key: string }
  | { type: "keyup"; key: string }
  | { type: "delay"; ms: number };


type Macro = {
  id: number;
  name: string;
  steps: MacroStep[];
  repeat: boolean;
  delayBetween: number;
};

type OLED = {
  logo: string | null;
  effect: "none" | "pulse" | "scroll";
  perProfile: boolean;
  layout: {
    A: string;
    B: string;
    C: string;
  };
};

type Encoder = {
  left: string;
  right: string;
  press: string;
};

type DeviceState = {
  /* DEVICE */
  connected: boolean;
  connect: () => void;
  disconnect: () => void;

  /* LAYERS */
  currentLayer: number;
  setLayer: (layer: number) => void;
  layers: number[];

  /* KEYMAP */
  keymaps: string[][];
  setKey: (index: number, value: string) => void;

  selectedKey: number | null;
  setSelectedKey: (index: number) => void;

  /* PROFILES */
  profiles: Profile[];
  currentProfile: string;

  createProfile: (name: string) => void;
  loadProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  duplicateProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;

  exportProfile: (id: string) => void;
  importProfile: (data: Profile) => void;

  /* MACROS */
  macros: Macro[];
  selectedMacroId: number | null;
  addMacro: () => void;
  selectMacro: (id: number) => void;
  addStep: (step: MacroStep) => void;
  removeStep: (index: number) => void;
  reorderSteps: (from: number, to: number) => void;
  toggleRepeat: () => void;
  setDelayBetween: (value: number) => void;

  /* ENCODER */
  encoder: Encoder;
  setEncoder: (type: keyof Encoder, value: string) => void;

  /* OLED */
  oled: OLED;
  setOled: (data: Partial<OLED>) => void;
  setOledLayout: (zone: "A" | "B" | "C", value: string) => void;
  setOledLogo: (logo: string | null) => void;
  setOledEffect: (effect: OLED["effect"]) => void;
  setOledProfileMode: (value: boolean) => void;
};

/* STORE */
export const useDeviceStore = create<DeviceState>((set, get) => ({
  connected: true,
  connect: () => set({ connected: true }),
  disconnect: () => set({ connected: false }),

  currentLayer: 0,
  setLayer: (layer) => set({ currentLayer: layer }),
  layers: [0, 1, 2, 3],

  keymaps: [
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
      return { keymaps: newKeymaps };
    }),

  selectedKey: null,
  setSelectedKey: (index) => set({ selectedKey: index }),

  /* PROFILES */
  profiles: [
    {
      id: "1",
      name: "Default",
      keymaps: [
        Array(18).fill("KC_1"),
        Array(18).fill("KC_2"),
        Array(18).fill("KC_3"),
        Array(18).fill("KC_4"),
      ],
    },
  ],

  currentProfile: "1",

  createProfile: (name) =>
    set((state) => ({
      profiles: [
        ...state.profiles,
        {
          id: Date.now().toString(),
          name,
          keymaps: state.keymaps,
        },
      ],
    })),

  loadProfile: (id) =>
    set((state) => {
      const p = state.profiles.find((x) => x.id === id);
      if (!p) return state;
      return { keymaps: p.keymaps, currentProfile: id };
    }),

  deleteProfile: (id) =>
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== id),
    })),

  duplicateProfile: (id) =>
    set((state) => {
      const p = state.profiles.find((x) => x.id === id);
      if (!p) return state;
      return {
        profiles: [
          ...state.profiles,
          {
            ...p,
            id: Date.now().toString(),
            name: p.name + " Copy",
          },
        ],
      };
    }),

  renameProfile: (id, name) =>
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === id ? { ...p, name } : p
      ),
    })),

  exportProfile: (id) => {
    const p = get().profiles.find((x) => x.id === id);
    if (!p) return;

    const blob = new Blob([JSON.stringify(p, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.name}.json`;
    a.click();
  },

  importProfile: (data) =>
    set((state) => ({
      profiles: [...state.profiles, { ...data, id: Date.now().toString() }],
    })),

  /* MACROS */
  macros: [],
  selectedMacroId: null,

  addMacro: () =>
    set((state) => ({
      macros: [
        ...state.macros,
        {
          id: Date.now(),
          name: "New Macro",
          steps: [],
          repeat: false,
          delayBetween: 0,
        },
      ],
    })),

  selectMacro: (id) => set({ selectedMacroId: id }),

  addStep: (step) =>
    set((state) => {
      const macro = state.macros.find((m) => m.id === state.selectedMacroId);
      if (!macro) return state;
      macro.steps.push(step);
      return { macros: [...state.macros] };
    }),

  removeStep: (index) =>
    set((state) => {
      const macro = state.macros.find((m) => m.id === state.selectedMacroId);
      if (!macro) return state;
      macro.steps.splice(index, 1);
      return { macros: [...state.macros] };
    }),

  reorderSteps: (from, to) =>
    set((state) => {
      const macro = state.macros.find((m) => m.id === state.selectedMacroId);
      if (!macro) return state;
      const [moved] = macro.steps.splice(from, 1);
      macro.steps.splice(to, 0, moved);
      return { macros: [...state.macros] };
    }),

  toggleRepeat: () =>
    set((state) => {
      const macro = state.macros.find((m) => m.id === state.selectedMacroId);
      if (!macro) return state;
      macro.repeat = !macro.repeat;
      return { macros: [...state.macros] };
    }),

  setDelayBetween: (value) =>
    set((state) => {
      const macro = state.macros.find((m) => m.id === state.selectedMacroId);
      if (!macro) return state;
      macro.delayBetween = value;
      return { macros: [...state.macros] };
    }),

  /* ENCODER */
  encoder: {
    left: "KC_A",
    right: "KC_B",
    press: "KC_C",
  },

  setEncoder: (type, value) =>
    set((state) => ({
      encoder: { ...state.encoder, [type]: value },
    })),

  /* OLED */
  oled: {
    logo: null,
    effect: "none",
    perProfile: false,
    layout: { A: "Layer", B: "Profile", C: "Custom" },
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
  })),

  setOledLogo: (logo) =>
  set((state) => ({
    oled: { ...state.oled, logo },
  })),

  setOledEffect: (effect) =>
  set((state) => ({
    oled: { ...state.oled, effect },
  })),

  setOledProfileMode: (value) =>
  set((state) => ({
    oled: { ...state.oled, perProfile: value },
  })),

  setOled: (data) =>
    set((state) => ({
      oled: { ...state.oled, ...data },
    })),
}));