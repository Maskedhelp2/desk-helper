use hidapi::HidDevice;
use crate::hid::find_device;

// =====================================
// Command IDs
// =====================================

pub const CMD_GET_VERSION: u8 = 0x01;
pub const CMD_GET_LAYOUT: u8 = 0x02;
pub const CMD_SET_KEY: u8 = 0x03;

pub const CMD_SET_ENCODER: u8 = 0x05;
pub const CMD_SET_MACRO: u8 = 0x07;

pub const CMD_SAVE: u8 = 0x0D;
pub const CMD_RESET: u8 = 0x0E;

// OLED
pub const CMD_OLED_WRITE: u8 = 0x20;
pub const CMD_OLED_CLEAR: u8 = 0x21;
pub const CMD_OLED_SAVE: u8 = 0x22;

// Firmware / Bootloader
pub const CMD_BOOTLOADER: u8 = 0x30;

// =====================================
// Build Packet
// =====================================

pub fn build_packet(
    cmd: u8,
    payload: &[u8],
) -> [u8; 32] {

    let mut packet = [0u8; 32];

    packet[0] = cmd;

    for (i, byte) in payload.iter().enumerate() {
        if i + 1 < 32 {
            packet[i + 1] = *byte;
        }
    }

    packet
}

// =====================================
// Send Command
// =====================================

pub fn send_command(
    device: &HidDevice,
    packet: [u8; 32],
) -> Result<[u8; 32], String> {

    device.write(&packet)
        .map_err(|e| format!("Write failed: {}", e))?;

    let mut response = [0u8; 32];

    device.read_timeout(
        &mut response,
        1000
    )
    .map_err(|e| format!("Read failed: {}", e))?;

    Ok(response)
}

// =====================================
// Get Version
// =====================================

pub fn get_version()
-> Result<String, String> {

    let device = find_device()
        .ok_or("No device connected")?;

    let packet =
        build_packet(CMD_GET_VERSION, &[]);

    let response =
        send_command(&device, packet)?;

    let version =
        String::from_utf8_lossy(
            &response[1..]
        )
        .trim_matches(char::from(0))
        .to_string();

    Ok(version)
}

// =====================================
// Get Layout
// =====================================

pub fn get_layout(
    layer: u8
) -> Result<Vec<u16>, String> {

    let device = find_device()
        .ok_or("No device connected")?;

    let packet =
        build_packet(
            CMD_GET_LAYOUT,
            &[layer]
        );

    let response =
        send_command(&device, packet)?;

    let mut keys = Vec::new();

    for i in 0..15 {
        let low =
            response[1 + i * 2] as u16;

        let high =
            response[2 + i * 2] as u16;

        keys.push(low | (high << 8));
    }

    Ok(keys)
}

// =====================================
// Set Key
// =====================================

pub fn set_key(
    layer: u8,
    index: u8,
    keycode: u16,
) -> Result<(), String> {

    let device = find_device()
        .ok_or("No device connected")?;

    let payload = [
        layer,
        index,
        (keycode & 0xFF) as u8,
        (keycode >> 8) as u8,
    ];

    let packet =
        build_packet(
            CMD_SET_KEY,
            &payload
        );

    send_command(&device, packet)?;

    Ok(())
}

// =====================================
// Set Encoder
// =====================================

pub fn set_encoder(
    cw: u16,
    ccw: u16,
) -> Result<(), String> {

    let device = find_device()
        .ok_or("No device connected")?;

    let payload = [
        (cw & 0xFF) as u8,
        (cw >> 8) as u8,
        (ccw & 0xFF) as u8,
        (ccw >> 8) as u8,
    ];

    let packet =
        build_packet(
            CMD_SET_ENCODER,
            &payload
        );

    send_command(&device, packet)?;

    Ok(())
}

// =====================================
// Set Macro
// =====================================

pub fn set_macro(
    slot: u8,
    text: String,
) -> Result<(), String> {

    let device = find_device()
        .ok_or("No device connected")?;

    let mut payload = vec![slot];
    payload.extend(text.as_bytes());

    let packet =
        build_packet(
            CMD_SET_MACRO,
            &payload
        );

    send_command(&device, packet)?;

    Ok(())
}

// =====================================
// Save Settings
// =====================================

pub fn save_to_device()
-> Result<(), String> {

    let device = find_device()
        .ok_or("No device connected")?;

    let packet =
        build_packet(CMD_SAVE, &[]);

    send_command(&device, packet)?;

    Ok(())
}

// =====================================
// Factory Reset
// =====================================

pub fn factory_reset()
-> Result<(), String> {

    let device = find_device()
        .ok_or("No device connected")?;

    let packet =
        build_packet(CMD_RESET, &[]);

    send_command(&device, packet)?;

    Ok(())
}
