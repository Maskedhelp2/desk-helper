import hid

VID = 0xFEED
PID = 0x0001

devices = hid.enumerate(VID, PID)

path = None
for d in devices:
    if d['usage_page'] == 0xFF60:
        path = d['path']
        break

if path is None:
    print("Device not found")
    exit()

h = hid.device()
h.open_path(path)

print("Connected")
print("Commands: profile <0-2> | mode <0-2> | setkey <row> <col> <key> | setmacro <id> <key1> <key2> ... | exit")

# Full HID keycode map
keymap = {
    "A": 0x04, "B": 0x05, "C": 0x06, "D": 0x07,
    "E": 0x08, "F": 0x09, "G": 0x0A, "H": 0x0B,
    "I": 0x0C, "J": 0x0D, "K": 0x0E, "L": 0x0F,
    "M": 0x10, "N": 0x11, "O": 0x12, "P": 0x13,
    "Q": 0x14, "R": 0x15, "S": 0x16, "T": 0x17,
    "U": 0x18, "V": 0x19, "W": 0x1A, "X": 0x1B,
    "Y": 0x1C, "Z": 0x1D,

    "1": 0x1E, "2": 0x1F, "3": 0x20, "4": 0x21,
    "5": 0x22, "6": 0x23, "7": 0x24, "8": 0x25,
    "9": 0x26, "0": 0x27,

    "ENTER":     0x28, "ESC":    0x29, "BSPACE": 0x2A,
    "TAB":       0x2B, "SPACE":  0x2C, "MINUS":  0x2D,
    "EQUAL":     0x2E, "LBRC":   0x2F, "RBRC":   0x30,
    "BSLASH":    0x31, "SCOLON": 0x33, "QUOTE":  0x34,
    "GRAVE":     0x35, "COMMA":  0x36, "DOT":    0x37,
    "SLASH":     0x38, "CAPS":   0x39,

    "F1":  0x3A, "F2":  0x3B, "F3":  0x3C, "F4":  0x3D,
    "F5":  0x3E, "F6":  0x3F, "F7":  0x40, "F8":  0x41,
    "F9":  0x42, "F10": 0x43, "F11": 0x44, "F12": 0x45,

    "PSCREEN": 0x46, "SCROLLLOCK": 0x47, "PAUSE": 0x48,
    "INSERT":  0x49, "HOME":       0x4A, "PGUP":  0x4B,
    "DELETE":  0x4C, "END":        0x4D, "PGDN":  0x4E,

    "RIGHT": 0x4F, "LEFT": 0x50, "DOWN": 0x51, "UP": 0x52,

    "NUMLOCK": 0x53,
    "KP_SLASH": 0x54, "KP_STAR": 0x55, "KP_MINUS": 0x56,
    "KP_PLUS":  0x57, "KP_ENTER": 0x58,
    "KP_1": 0x59, "KP_2": 0x5A, "KP_3": 0x5B,
    "KP_4": 0x5C, "KP_5": 0x5D, "KP_6": 0x5E,
    "KP_7": 0x5F, "KP_8": 0x60, "KP_9": 0x61,
    "KP_0": 0x62, "KP_DOT": 0x63,

    "MUTE": 0x7F, "VOLU": 0x80, "VOLD": 0x81,
}

modmap = {
    "CTRL":  0x0100,
    "SHIFT": 0x0200,
    "ALT":   0x0400,
    "GUI":   0x0800,
}

# BUG FIX 1: unknown key now raises a clear error instead of a silent KeyError crash
def encode(k):
    k = k.upper()
    if "+" in k:
        parts = k.split("+")
        val = 0
        for p in parts:
            if p in modmap:
                val |= modmap[p]
            elif p in keymap:
                val |= keymap[p]
            else:
                raise ValueError(f"Unknown key: '{p}'")
        return val
    if k not in keymap:
        raise ValueError(f"Unknown key: '{k}'")
    return keymap[k]

while True:
    try:
        cmd = input(">> ").strip()
    except (EOFError, KeyboardInterrupt):
        break

    if not cmd:
        continue

    data = [0] * 32

    try:
        if cmd.startswith("profile"):
            # BUG FIX 2: was cmd[-1] which breaks on "profile 12" → gave "2"
            # Now properly splits and parses the argument
            parts = cmd.split()
            if len(parts) != 2:
                print("Usage: profile <0-2>")
                continue
            val = int(parts[1])
            if not (0 <= val <= 2):
                print("Profile must be 0, 1, or 2")
                continue
            data[0] = 30
            data[1] = val

        elif cmd.startswith("mode"):
            # BUG FIX 3: same cmd[-1] problem as profile
            parts = cmd.split()
            if len(parts) != 2:
                print("Usage: mode <0-2>")
                continue
            val = int(parts[1])
            if not (0 <= val <= 2):
                print("Mode must be 0, 1, or 2")
                continue
            data[0] = 10
            data[1] = val

        elif cmd.startswith("setkey"):
            parts = cmd.split()
            if len(parts) != 4:
                print("Usage: setkey <row> <col> <key>")
                continue
            _, r, c, k = parts
            val = encode(k)
            data[0] = 20
            data[1] = int(r)
            data[2] = int(c)
            data[4] = val & 0xFF
            data[5] = (val >> 8) & 0xFF

        elif cmd.startswith("setmacro"):
            parts = cmd.split()
            if len(parts) < 3:
                print("Usage: setmacro <id> <key1> <key2> ...")
                continue
            mid = int(parts[1])
            seq = parts[2:]

            # BUG FIX 4: no guard against exceeding MACRO_LEN (5) — the C side
            # silently drops the whole macro if len > MACRO_LEN
            if len(seq) > 5:
                print(f"Too many keys — max 5 per macro (got {len(seq)})")
                continue
            if not (0 <= mid <= 9):
                print("Macro ID must be 0-9")
                continue

            data[0] = 40
            data[1] = mid
            data[2] = len(seq)

            idx = 3
            for k in seq:
                val = encode(k)
                data[idx]     = val & 0xFF
                data[idx + 1] = (val >> 8) & 0xFF
                idx += 2

        elif cmd == "exit":
            break

        else:
            print("Unknown command. Try: profile / mode / setkey / setmacro / exit")
            continue

        h.write([0] + data)

    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"HID error: {e}")
        break

h.close()
print("Disconnected")