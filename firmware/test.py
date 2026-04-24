import pywinusb.hid as hid

VID = 0xFEED
PID = 0x0001

# Find device
devices = hid.HidDeviceFilter(vendor_id=VID, product_id=PID).get_devices()

if not devices:
    print("Device not found")
    exit()

device = devices[0]
device.open()

print("Connected")
print("Commands: mode0 | mode1 | mode2 | setkey | exit")

while True:
    cmd = input("Enter command: ").strip()

    data = [0] * 33  # 🔥 33 bytes (important)

    if cmd == "mode0":
        data[1] = 10
        data[2] = 0

    elif cmd == "mode1":
        data[1] = 10
        data[2] = 1

    elif cmd == "mode2":
        data[1] = 10
        data[2] = 2

    elif cmd == "setkey":
        print("Changing key (0,0) → A")
        data[1] = 20
        data[2] = 0   # row
        data[3] = 0   # col
        data[4] = 4   # KC_A

    elif cmd == "exit":
        break

    else:
        print("Unknown command")
        continue

    device.send_output_report(data)

device.close()