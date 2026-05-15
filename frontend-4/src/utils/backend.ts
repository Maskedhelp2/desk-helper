import { invoke } from "@tauri-apps/api/core";

export async function getVersion() {
  return await invoke("get_version");
}

export async function getProfile(profile: number) {
  return await invoke("get_profile", {
    profile,
  });
}

export async function setProfile(profile: number) {
  return await invoke("set_profile", {
    profile,
  });
}

export async function setKey(
  row: number,
  col: number,
  keycode: number
) {
  return await invoke("set_key", {
    row,
    col,
    keycode,
  });
}

export async function saveToDevice() {
  return await invoke("save_to_device");
}

export async function rebootToBootloader() {
  return await invoke("reboot_to_bootloader");
}

export async function flashFirmware(path: string) {
  return await invoke("flash_firmware", {
    path,
  });
}

export async function rebootAndFlash(path: string) {
  return await invoke("reboot_and_flash", {
    path,
  });
}

export async function clearOLED() {
  return await invoke("clear_oled");
}

export async function saveOLED(data: any) {
  return await invoke("save_oled", {
    data,
  });
}

export async function setOLEDMode(mode: string) {
  return await invoke("set_oled_mode", {
    mode,
  });
}