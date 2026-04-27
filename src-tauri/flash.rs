use std::fs;
use std::path::Path;

// =====================================
// Reboot Device Into Bootloader
// =====================================

pub fn reboot_to_bootloader()
-> Result<(), String> {

    let device =
        crate::hid::find_device()
        .ok_or("No device connected")?;

    let packet =
        crate::protocol::build_packet(
            crate::protocol::CMD_BOOTLOADER,
            &[]
        );

    crate::protocol::send_command(
        &device,
        packet
    )?;

    Ok(())
}

// =====================================
// Detect Bootloader Drive
// macOS path
// =====================================

pub fn is_bootloader_present() -> bool {
    Path::new("/Volumes/RPI-RP2")
        .exists()
}

// =====================================
// Flash UF2 Firmware
// =====================================

pub fn flash_firmware(
    source_path: String
) -> Result<(), String> {

    let source =
        Path::new(&source_path);

    if !source.exists() {
        return Err(
            "Firmware file not found"
            .to_string()
        );
    }

    if !is_bootloader_present() {
        return Err(
            "Bootloader drive not mounted"
            .to_string()
        );
    }

    let target =
        "/Volumes/RPI-RP2/FIRMWARE.UF2";

    fs::copy(source, target)
        .map_err(|e| e.to_string())?;

    Ok(())
}
