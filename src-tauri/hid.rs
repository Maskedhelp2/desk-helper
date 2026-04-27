use hidapi::{HidApi, HidDevice};

pub const VID: u16 = 0xFEED;
pub const PID: u16 = 0x0001;

pub fn find_device() -> Option<HidDevice> {
    let api = HidApi::new().ok()?;

    for device in api.device_list() {
        if device.vendor_id() == VID &&
           device.product_id() == PID
        {
            return device.open_device(&api).ok();
        }
    }

    None
}
