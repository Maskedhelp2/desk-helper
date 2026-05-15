import { create } from "zustand";
import toast from "react-hot-toast";
//import { mockBackend } from "../mockBackend";
import { invoke } from "@tauri-apps/api/core";
import { persist } from "zustand/middleware";
import { saveToDevice as backendSave, setKey as backendSetKey, } from "../utils/backend";
import { getVersion } from "../utils/backend";

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
  deviceName: string;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  setLoading: (value: boolean) => void;
  fetchFromDevice: () => Promise<void>;
  saveToDevice: () => Promise<boolean>;
  hasInitialized: boolean;
  lastSyncTime: number;
  updateSyncTime: () => void;

  currentLayer: number;
  setLayer: (layer: number) => void;
  layers: number[];

  setKey: (
  layer: number,
  index: number,
  value: string
) => void;

  selectedKey: number | null;
  setSelectedKey: (index: number) => void;

  profiles: Profile[];
  currentProfile: string;

  createProfile: (name: string) => void;
  loadProfile: (id: string) => void;
  deleteProfile: (id: string) => void;
  duplicateProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
  setCurrentProfile: (id: string) => void;

  exportProfile: (id: string) => void;
  importProfile: (data: Profile) => void;

  macros: Macro[];
  selectedMacroId: number | null;
  addMacro: () => void;
  deleteMacro: (id: number) => void;
  selectMacro: (id: number) => void;
  addStep: (step: MacroStep) => void;
  removeStep: (index: number) => void;
  reorderSteps: (from: number, to: number) => void;
  toggleRepeat: () => void;
  setDelayBetween: (value: number) => void;

  encoder: Encoder;
  setEncoder: (type: keyof Encoder, value: string) => void;

  oled: OLED;
  setOled: (data: Partial<OLED>) => void;
  setOledLayout: (zone: "A" | "B" | "C", value: string) => void;
  setOledLogo: (logo: string | null) => void;
  setOledEffect: (effect: OLED["effect"]) => void;
  setOledProfileMode: (value: boolean) => void;

  hasUnsavedChanges: boolean;
  saveChanges: () => void;

  isFlashing: boolean;
  flashFirmware: () => Promise<void>;

  themeColor: "blue" | "purple" | "green" | "red";
  setThemeColor: (color: "blue" | "purple" | "green" | "red") => void;

  autoSave: boolean;
  showKeycodes: boolean;
  confirmOverwrite: boolean;

  setAutoSave: (v: boolean) => void;
  setShowKeycodes: (v: boolean) => void;
  setConfirmOverwrite: (v: boolean) => void;
};


function convertKeycode(key: string): number {
  const map: Record<string, number> = {
    I: 12,
    Q: 20,
    W: 26,
    E: 8,
    F: 9,
    Z: 29,
    A: 4,
    S: 22,
    D: 7,
    L: 15,
    O: 18,
    N: 17,
    B: 5,

    CTRL: 224,
    SPACE: 44,
    ENTER: 40,
  };

  return map[key] || 0;
}

/* STORE */
export const useDeviceStore = create<DeviceState>((set, get) => ({
  deviceName: "my_numpad v1.0",
  connected: false,
  hasInitialized: false,

  themeColor: "blue",
  setThemeColor: (color) =>
    set({
      themeColor: color,
    }),

  /* 🔥 UPDATED */
  connect: async () => {
    set({
      isLoading: true,
      error: null,
    });
    try {
      const version = await getVersion();
      set({
        connected: true,
        deviceName: version as string,
        isLoading: false,
      });
      toast.success("Device connected");
    } catch (err) {
      console.error(err);
      set({
        connected: false,
        isLoading: false,
        error: "No device found",
      });
      toast.error("No hardware connected");
    }
  },

  /* 🔥 UPDATED */
  disconnect: () => {
    set({ connected: false, deviceName: "" });
    toast.error("Device disconnected");
  },

  isLoading: false,
  isSaving: false,
  error: null,
  
  isFlashing: false,
  flashFirmware: async () => {
    set({ isFlashing: true, error: null });
    try {
      await new Promise((res) => setTimeout(res, 1500));
      toast.success("Firmware flashed successfully");
      set({ isFlashing: false });
    } catch (err) {
      console.error(err);
    set({
      isFlashing: false,
      error: "Firmware flash failed",
    });
    toast.error("Firmware flash failed");
  }
},

autoSave: false,
showKeycodes: true,
confirmOverwrite: true,

setAutoSave: (v) => set({ autoSave: v }),
setShowKeycodes: (v) => set({ showKeycodes: v }),
setConfirmOverwrite: (v) => set({ confirmOverwrite: v }),

  setLoading: (value) => set({ isLoading: value }),

  lastSyncTime: Date.now(),
  updateSyncTime: () => set({ lastSyncTime: Date.now() }),

  fetchFromDevice: async () => {
  try {
    const profile = get().profiles.find(
      (p) => p.id === get().currentProfile
    );
    const data = profile?.keymaps || [];

    set((state) => {
      const profile = state.profiles.find(
        (p) => p.id === state.currentProfile
      );

      if (!profile) {
        return {};
      }

      return {
        profiles: state.profiles.map((p) =>
          p.id === state.currentProfile
            ? { ...p, keymaps: data as string[][] }
            : p
        ),
      };
    });
    get().updateSyncTime();

  } catch (err) {
    console.error("Fetch failed", err);
  }
},

  /* 🔥 NEW */
  saveToDevice: async () => {

  set({ isSaving: true });

  try {
    await backendSave();
    get().updateSyncTime();

    // 🔥 IMPORTANT — force clean state AFTER everything settles
    setTimeout(() => {
      set({
        hasUnsavedChanges: false,
        isSaving: false,
      });
    }, 0);

    toast.success("Saved successfully");
    return true;
  } catch (err) {
    set({
      isSaving: false,
      error: "Failed to save",
    });

    toast.error("Save failed");
    return false;
  }
},


  currentLayer: 0,
  setLayer: (layer) => set({ currentLayer: layer }),
  layers: [0, 1, 2, 3, 4],

  
  

  selectedKey: null,
  setSelectedKey: (index) => set({ selectedKey: index }),

  setKey: async (layer, index, value) => {

  // UI UPDATE
  set((state) => {
    const updatedProfiles = [...state.profiles];

    const profileIndex = updatedProfiles.findIndex(
      (p) => p.id === state.currentProfile
    );

    if (profileIndex === -1) return state;

    const keymaps = [
      ...updatedProfiles[profileIndex].keymaps,
    ];

    const layerMap = [...keymaps[layer]];

    layerMap[index] = value;

    keymaps[layer] = layerMap;

    updatedProfiles[profileIndex] = {
      ...updatedProfiles[profileIndex],
      keymaps,
    };

    return {
      profiles: updatedProfiles,
      hasUnsavedChanges: true,
    };
  });

  // HARDWARE UPDATE
  try {
    await backendSetKey(
      layer,
      index,
      convertKeycode(value)
    );

    console.log(
      "Sent to hardware:",
      layer,
      index,
      value
    );
  } catch (err) {
    console.error("Hardware setKey failed", err);
  }
},

  profiles: [
    {
      id: "1",
      name: "Default",
      keymaps: [
        [
        "I",
        "Q",
        "W",
        "E",
        "F",
        "Z",
        "A",
        "S",
        "D",
        "L",
        "O",
        "N",
        "B",
        "CTRL",
        "SPACE",
        "CTRL",
        "SPACE",
        "ENTER"],

        [
        "I",
        "Q",
        "W",
        "E",
        "F",
        "Z",
        "A",
        "S",
        "D",
        "L",
        "O",
        "N",
        "B",
        "CTRL",
        "SPACE",
        "CTRL",
        "SPACE",
        "ENTER"
        ],

        [
        "I",
        "Q",
        "W",
        "E",
        "F",
        "Z",
        "A",
        "S",
        "D",
        "L",
        "O",
        "N",
        "B",
        "CTRL",
        "SPACE",
        "CTRL",
        "SPACE",
        "ENTER"
        ],
        
        [
        "I",
        "Q",
        "W",
        "E",
        "F",
        "Z",
        "A",
        "S",
        "D",
        "L",
        "O",
        "N",
        "B",
        "CTRL",
        "SPACE",
        "CTRL",
        "SPACE",
        "ENTER"
        ],

        [
        "I",
        "Q",
        "W",
        "E",
        "F",
        "Z",
        "A",
        "S",
        "D",
        "L",
        "O",
        "N",
        "B",
        "CTRL",
        "SPACE",
        "CTRL",
        "SPACE",
        "ENTER"
        ],
        Array(18).fill("KC_1"),
        Array(18).fill("KC_2"),
        Array(18).fill("KC_3"),
        Array(18).fill("KC_4"),
        Array(18).fill("KC_5"),
      ],
    },
  ],

  currentProfile: "1",

  createProfile: (name) =>
    set((state) => {
      const newProfile = {
        id: Date.now().toString(),
        name,
        keymaps: JSON.parse(
          JSON.stringify(
            state.profiles.find(
              (p) => p.id === state.currentProfile
            )?.keymaps || []
          )
        ),
      };
      return {
        profiles: [...state.profiles, newProfile],
      };
    }),

  loadProfile: (id) =>
    set((state) => {
      const p = state.profiles.find((x) => x.id === id);
      if (!p) return state;
      toast.success("Profile loaded");
      return {currentProfile: id };
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

    setCurrentProfile: (id) =>
  set({
    currentProfile: id,
  }),

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

  macros: [],
  selectedMacroId: null,

  addMacro: () =>
    set((state) => ({
      macros: [
        ...state.macros,
        {
          id: Date.now(),
          name: `Macro ${state.macros.length + 1}`,
          steps: [],
          repeat: false,
          delayBetween: 0,
        },
      ],
    })),

    deleteMacro: (id) =>
  set((state) => ({
    macros: state.macros.filter(
      (m) => m.id !== id
    ),

    selectedMacroId:
      state.selectedMacroId === id
        ? null
        : state.selectedMacroId,
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

  encoder: {
    left: "KC_A",
    right: "KC_B",
    press: "KC_C",
  },

  setEncoder: (type, value) => {
    set((state) => {
      const updated = { ...state.encoder, [type]: value };
      //setEncoderConfig(updated.left, updated.right, updated.press);
      return {
        encoder: updated,
        hasUnsavedChanges: true,
      };
    });
  },

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
    set((state) => {
      const updated = { ...state.oled, ...data };
      //setOLEDConfig(updated);
      return {
        oled: updated,
        hasUnsavedChanges: true,
      };
    }),

  hasUnsavedChanges: false,

  saveChanges: () =>
    set({
      hasUnsavedChanges: false,
    }),
}));