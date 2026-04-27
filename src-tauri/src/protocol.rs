use serde::{Serialize, Deserialize};
use std::fs;

// ============================
// Profile Struct
// ============================

#[derive(Serialize, Deserialize)]
pub struct Profile {
    pub name: String,
    pub layout: Vec<u16>,

    // Encoder (now complete)
    pub encoder_ccw: u16,
    pub encoder_cw: u16,
    pub encoder_press: u16,   // ✅ FIX ADDED

    pub macros: Vec<String>,
}

// ============================
// Save Profile
// ============================

pub fn save_profile(
    profile: Profile
) -> Result<(), String> {

    fs::create_dir_all("profiles")
        .map_err(|e| e.to_string())?;

    let json =
        serde_json::to_string_pretty(&profile)
        .map_err(|e| e.to_string())?;

    let path = format!(
        "profiles/{}.json",
        profile.name
    );

    fs::write(path, json)
        .map_err(|e| e.to_string())?;

    Ok(())
}

// ============================
// Load Profile
// ============================

pub fn load_profile(
    name: String
) -> Result<Profile, String> {

    let path = format!(
        "profiles/{}.json",
        name
    );

    let text =
        fs::read_to_string(path)
        .map_err(|e| e.to_string())?;

    let profile: Profile =
        serde_json::from_str(&text)
        .map_err(|e| e.to_string())?;

    Ok(profile)
}

// ============================
// List Profiles
// ============================

pub fn list_profiles()
-> Result<Vec<String>, String> {

    let mut names = Vec::new();

    fs::create_dir_all("profiles")
        .map_err(|e| e.to_string())?;

    for entry in fs::read_dir("profiles")
        .map_err(|e| e.to_string())? {

        let file =
            entry.map_err(|e| e.to_string())?;

        let name = file.file_name()
            .to_string_lossy()
            .replace(".json", "");

        names.push(name);
    }

    Ok(names)
}

// ============================
// Delete Profile
// ============================

pub fn delete_profile(
    name: String
) -> Result<(), String> {

    let path = format!(
        "profiles/{}.json",
        name
    );

    fs::remove_file(path)
        .map_err(|e| e.to_string())?;

    Ok(())
}
pub fn get_profile_name(_profile: u8) -> Result<String, String> {
    Ok("Profile".into())
}

pub fn set_profile_name(_profile: u8, _name: String) -> Result<(), String> {
    Ok(())
}

pub fn get_layout(_profile: u8) -> Result<Vec<u16>, String> {
    Ok(vec![0; 20])
}

pub fn get_encoder(_profile: u8) -> Result<Vec<u16>, String> {
    Ok(vec![0, 0, 0])
}

pub fn set_encoder(_profile: u8, _action: u8, _keycode: u16) -> Result<(), String> {
    Ok(())
}

pub fn get_macro(_slot: u8) -> Result<Vec<u16>, String> {
    Ok(vec![])
}

pub fn set_macro(_slot: u8, _keys: Vec<u16>) -> Result<(), String> {
    Ok(())
}

pub fn set_oled_mode(_mode: u8) -> Result<(), String> {
    Ok(())
}