use image::imageops::FilterType;
use crate::hid::find_device;
use crate::hid::{
    build_packet,
    send_command,
    CMD_SET_OLED_MODE,
    CMD_SET_OLED_FRAME,
};

// ======================================
// Convert image → OLED 128x64 bitmap
// ======================================

pub fn image_to_oled_bytes(
    raw: Vec<u8>
) -> Result<Vec<u8>, String> {

    let img = image::load_from_memory(&raw)
        .map_err(|e| e.to_string())?;

    let resized = img.resize_exact(
        128,
        64,
        FilterType::Nearest
    );

    let gray = resized.to_luma8();

    let mut bytes = vec![0u8; 1024];

    for y in 0..64 {
        for x in 0..128 {

            let pixel = gray.get_pixel(x, y)[0];

            if pixel < 128 {

                let byte_index =
                    (y * 16 + x / 8) as usize;

                let bit =
                    7 - (x % 8);

                bytes[byte_index] |=
                    1 << bit;
            }
        }
    }

    Ok(bytes)
}

// ======================================
// Upload full OLED frame (1024 bytes)
// ======================================

pub fn upload_oled(
    bytes: Vec<u8>
) -> Result<(), String> {

    if bytes.len() != 1024 {
        return Err("OLED data must be 1024 bytes".into());
    }

    let device = find_device()
        .ok_or("No device connected")?;

    // switch to frame mode
    let mode_packet = build_packet(
        CMD_SET_OLED_MODE,
        &[1]
    );

    send_command(&device, mode_packet)?;

    // send 30-byte chunks (total 34 chunks)
    let total_chunks = 34;

    for chunk_index in 0..total_chunks {

        let start = chunk_index * 30;
        let end = usize::min(start + 30, 1024);

        let mut payload = vec![chunk_index as u8];

        payload.extend_from_slice(&bytes[start..end]);

        // pad last chunk
        while payload.len() < 31 {
            payload.push(0);
        }

        let packet = build_packet(
            CMD_SET_OLED_FRAME,
            &payload
        );

        send_command(&device, packet)?;
    }

    Ok(())
}

// ======================================
// Switch OLED mode manually
// 0 = info, 1 = custom frame
// ======================================

pub fn set_oled_mode(mode: u8)
-> Result<(), String> {

    let device = find_device()
        .ok_or("No device connected")?;

    let packet = build_packet(
        CMD_SET_OLED_MODE,
        &[mode]
    );

    send_command(&device, packet)?;

    Ok(())
}
pub fn clear_oled() -> Result<(), String> {
    Ok(())
}

pub fn save_oled() -> Result<(), String> {
    Ok(())
}