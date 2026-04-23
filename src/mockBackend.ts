export const mockBackend = {
  connected: true,
  layers: ["Layer 0", "Layer 1", "Layer 2", "Layer 3"],

  keymap: Array(17).fill("KC_1"),

  encoder: {
    left: "KC_VOLD",
    right: "KC_VOLU",
    press: "KC_MUTE",
  },

  macros: [],
};