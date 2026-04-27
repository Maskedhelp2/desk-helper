use image::imageops::FilterType;
use crate::hid::find_device;
use crate::protocol::{
    build_packet,
    send_command,
    CMD_OLED_WRITE,
    CMD_OLED_CLEAR,
    CMD_OLED_SAVE,
};

// ======================================
// Convert uploaded image bytes
// PNG/JPG -> 128x64 OLED bitmap (1024B)
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

            let pixel =
                gray.get_pixel(x, y)[0];

            // black pixel = ON
            if pixel < 128 {

                let page = y / 8;
                let index =
                    page * 128 + x;

                let bit = y % 8;

                bytes[index as usize] |=
                    1 << bit;
            }
        }
    }

    Ok(bytes)
}

// ======================================
// Upload bitmap bytes to OLED
// Sends in chunks
// ======================================

pub fn upload_oled(
    bytes: Vec<u8>
) -> Result<(), String> {

    let device = find_device()
        .ok_or("No device connected")?;

    // 28-byte chunks
    for chunk in bytes.chunks(28) {

        let mut payload = vec![];

        payload.extend(chunk);

        let packet = build_packet(
            CMD_OLED_WRITE,
            &payload
        );

        send_command(
            &device,
            packet
        )?;
    }

    Ok(())
}

// ======================================
// Clear OLED Screen
// ======================================

pub fn clear_oled()
-> Result<(), String> {

    let device = find_device()
        .ok_or("No device connected")?;

    let packet = build_packet(
        CMD_OLED_CLEAR,
        &[]
    );

    send_command(
        &device,
        packet
    )?;

    Ok(())
}

// ======================================
// Save OLED image to EEPROM / Flash
// ======================================

pub fn save_oled()
-> Result<(), String> {

    let device = find_device()
        .ok_or("No device connected")?;

    let packet = build_packet(
        CMD_OLED_SAVE,
        &[]
    );

    send_command(
        &device,
        packet
    )?;

    Ok(())
}
