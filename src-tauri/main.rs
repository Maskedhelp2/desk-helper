mod hid;
mod protocol;
mod profiles;
mod oled;
mod flash;

#[tauri::command]
fn get_connection_status() -> bool {
    hid::find_device().is_some()
}

#[tauri::command]
fn get_version() -> Result<String, String> {
    protocol::get_version()
}

#[tauri::command]
fn get_layout(layer: u8) -> Result<Vec<u16>, String> {
    protocol::get_layout(layer)
}

#[tauri::command]
fn set_key(
    layer: u8,
    index: u8,
    keycode: u16,
) -> Result<(), String> {
    protocol::set_key(layer, index, keycode)
}

#[tauri::command]
fn set_encoder(
    cw: u16,
    ccw: u16,
) -> Result<(), String> {
    protocol::set_encoder(cw, ccw)
}

#[tauri::command]
fn set_macro(
    slot: u8,
    text: String,
) -> Result<(), String> {
    protocol::set_macro(slot, text)
}

#[tauri::command]
fn save_to_device() -> Result<(), String> {
    protocol::save_to_device()
}

#[tauri::command]
fn factory_reset() -> Result<(), String> {
    protocol::factory_reset()
}

// Profiles

#[tauri::command]
fn save_profile(
    profile: profiles::Profile
) -> Result<(), String> {
    profiles::save_profile(profile)
}

#[tauri::command]
fn load_profile(
    name: String
) -> Result<profiles::Profile, String> {
    profiles::load_profile(name)
}

#[tauri::command]
fn list_profiles()
-> Result<Vec<String>, String> {
    profiles::list_profiles()
}

#[tauri::command]
fn delete_profile(
    name: String
) -> Result<(), String> {
    profiles::delete_profile(name)
}

// OLED

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

// Flashing

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

fn main() {
    tauri::Builder::default()
        .invoke_handler(
            tauri::generate_handler![
                get_connection_status,
                get_version,
                get_layout,
                set_key,
                set_encoder,
                set_macro,
                save_to_device,
                factory_reset,
                save_profile,
                load_profile,
                list_profiles,
                delete_profile,
                upload_oled_image,
                clear_oled,
                save_oled,
                reboot_to_bootloader,
                is_bootloader_present,
                flash_firmware
            ]
        )
        .run(
            tauri::generate_context!()
        )
        .expect("error");
}
