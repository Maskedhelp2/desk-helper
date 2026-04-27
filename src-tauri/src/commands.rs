use crate::{hid, flash};

#[tauri::command]
pub fn get_version() -> Result<String, String> {
    hid::get_version()
}

#[tauri::command]
pub fn get_profile() -> Result<u8, String> {
    hid::get_profile()
}

#[tauri::command]
pub fn set_profile(p: u8) -> Result<(), String> {
    hid::set_profile(p)
}



#[tauri::command]
pub fn save_to_device() -> Result<(), String> {
    hid::save_to_device()
}

#[tauri::command]
pub fn reboot_to_bootloader() -> Result<(), String> {
    flash::reboot_to_bootloader()
}

#[tauri::command]
pub fn flash_firmware(path: String) -> Result<(), String> {
    flash::flash_firmware(path)
}

#[tauri::command]
pub fn reboot_and_flash(path: String) -> Result<(), String> {
    flash::reboot_and_flash(path)
}
#[tauri::command]
pub fn clear_oled() -> Result<(), String> {
    crate::oled::clear_oled()
}

#[tauri::command]
pub fn save_oled() -> Result<(), String> {
    crate::oled::save_oled()
}

#[tauri::command]
pub fn set_oled_mode(mode: u8) -> Result<(), String> {
    crate::hid::set_oled_mode(mode)
}

#[tauri::command]
pub fn set_key(profile: u8, row: u8, col: u8, key: u16) -> Result<(), String> {
    hid::set_key(profile, row, col, key)
}