mod hid;
mod protocol;
mod profiles;
mod oled;
mod flash;

use profiles::Profile;

// =====================================
// Device Status
// =====================================

#[tauri::command]
fn get_connection_status() -> bool {
    hid::find_device().is_some()
}

// =====================================
// Version
// =====================================

#[tauri::command]
fn get_version() -> Result<String, String> {
    hid::get_version()
}

// =====================================
// Profiles
// =====================================

#[tauri::command]
fn get_profile() -> Result<u8, String> {
    hid::get_profile()
}

#[tauri::command]
fn set_profile(
    profile: u8
) -> Result<(), String> {
    hid::set_profile(profile)
}

#[tauri::command]
fn get_profile_name(
    profile: u8
) -> Result<String, String> {
    protocol::get_profile_name(profile)
}

#[tauri::command]
fn set_profile_name(
    profile: u8,
    name: String
) -> Result<(), String> {
    protocol::set_profile_name(
        profile,
        name
    )
}

// =====================================
// Layout / Keys
// =====================================

#[tauri::command]
fn get_layout(
    profile: u8
) -> Result<Vec<u16>, String> {
    protocol::get_layout(profile)
}

// frontend sends index
// convert to row/col
#[tauri::command]
fn set_key(
    profile: u8,
    index: u8,
    keycode: u16
) -> Result<(), String> {

    let cols: u8 = 5;

    let row = index / cols;
    let col = index % cols;

    hid::set_key(
        profile,
        row,
        col,
        keycode
    )
}

// =====================================
// Encoder
// =====================================

#[tauri::command]
fn get_encoder(
    profile: u8
) -> Result<Vec<u16>, String> {
    protocol::get_encoder(profile)
}

// action:
// 0 = clockwise
// 1 = counter-clockwise
// 2 = press (optional)
#[tauri::command]
fn set_encoder(
    profile: u8,
    action: u8,
    keycode: u16
) -> Result<(), String> {

    protocol::set_encoder(
        profile,
        action,
        keycode
    )
}

// =====================================
// Macros
// =====================================

#[tauri::command]
fn get_macro(
    slot: u8
) -> Result<Vec<u16>, String> {
    protocol::get_macro(slot)
}

// frontend passes raw keycodes
#[tauri::command]
fn set_macro(
    slot: u8,
    keycodes: Vec<u16>
) -> Result<(), String> {

    protocol::set_macro(
        slot,
        keycodes
    )
}

// =====================================
// Save / Reset
// =====================================

#[tauri::command]
fn save_to_device()
-> Result<(), String> {
    hid::save_to_device()
}

#[tauri::command]
fn factory_reset()
-> Result<(), String> {
    hid::factory_reset()
}

// =====================================
// Local JSON Profiles
// =====================================

#[tauri::command]
fn save_profile_file(
    profile: Profile
) -> Result<(), String> {
    profiles::save_profile(profile)
}

#[tauri::command]
fn load_profile_file(
    name: String
) -> Result<Profile, String> {
    profiles::load_profile(name)
}

#[tauri::command]
fn list_profiles_file()
-> Result<Vec<String>, String> {
    profiles::list_profiles()
}

#[tauri::command]
fn delete_profile_file(
    name: String
) -> Result<(), String> {
    profiles::delete_profile(name)
}

// =====================================
// OLED
// =====================================

#[tauri::command]
fn upload_oled_image(
    bytes: Vec<u8>
) -> Result<(), String> {

    let oled_bytes =
        oled::image_to_oled_bytes(bytes)?;

    oled::upload_oled(oled_bytes)
}

#[tauri::command]
fn clear_oled()
-> Result<(), String> {
    oled::clear_oled()
}

#[tauri::command]
fn save_oled()
-> Result<(), String> {
    oled::save_oled()
}

#[tauri::command]
fn set_oled_mode(
    mode: u8
) -> Result<(), String> {
    protocol::set_oled_mode(mode)
}

// =====================================
// Firmware Update
// =====================================

#[tauri::command]
fn reboot_to_bootloader()
-> Result<(), String> {
    flash::reboot_to_bootloader()
}

#[tauri::command]
fn is_bootloader_present() -> bool {
    flash::is_bootloader_present()
}

#[tauri::command]
fn flash_firmware(
    path: String
) -> Result<(), String> {
    flash::flash_firmware(path)
}

#[tauri::command]
fn reboot_and_flash(
    path: String
) -> Result<(), String> {
    flash::reboot_and_flash(path)
}

// =====================================
// Main
// =====================================

fn main() {

    tauri::Builder::default()
        .invoke_handler(
            tauri::generate_handler![

                get_connection_status,
                get_version,

                get_profile,
                set_profile,
                get_profile_name,
                set_profile_name,

                get_layout,
                set_key,

                get_encoder,
                set_encoder,

                get_macro,
                set_macro,

                save_to_device,
                factory_reset,

                save_profile_file,
                load_profile_file,
                list_profiles_file,
                delete_profile_file,

                upload_oled_image,
                clear_oled,
                save_oled,
                set_oled_mode,

                reboot_to_bootloader,
                is_bootloader_present,
                flash_firmware,
                reboot_and_flash
            ]
        )
        .run(
            tauri::generate_context!()
        )
        .expect("error");
}
