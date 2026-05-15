import { useDeviceStore } from "../store/deviceStore";
import { setKey as sendKeyToDevice } from "../utils/backend";

type Props = {
  index: number;
  currentLayer: number;
};

function Key({ index, currentLayer }: Props) {
  const {
    profiles,
    currentProfile,
    selectedKey,
    setSelectedKey,
    macros,
    themeColor,
    showKeycodes,
  } = useDeviceStore();

  const profile = profiles.find(
    (p) => p.id === currentProfile
  );

  const label =
    profile?.keymaps?.[currentLayer]?.[index] ||
    "KC_NO";

  const themeStyles = {
    blue: {
      ring: "ring-blue-500",
    },
    purple: {
      ring: "ring-purple-500",
    },
    green: {
      ring: "ring-green-500",
    },
    red: {
      ring: "ring-red-500",
    },
  };

  const theme =
    themeStyles[
      themeColor as keyof typeof themeStyles
    ];

  const handleClick = async () => {
    setSelectedKey(index);

    const indexMap = [
      [0, 1, 2, 3, 4],
      [5, 6, 7, 8, 9],
      [10, 11, 12],
      [13, 14],
      [15, 16],
    ];

    let row = 0;
    let col = 0;

    for (let r = 0; r < indexMap.length; r++) {
      const c = indexMap[r].indexOf(index);

      if (c !== -1) {
        row = r;
        col = c;
        break;
      }
    }

    const keycode = 0x04;

    try {
      await sendKeyToDevice(
        row,
        col,
        keycode
      );
    } catch {
      console.log("Device not connected");
    }
  };

  const isSelected =
    selectedKey === index;

  const displayLabel = (() => {
    if (label.startsWith("MACRO_")) {
      const id = label.replace(
        "MACRO_",
        ""
      );

      const macro = macros.find(
        (m: any) =>
          m.id.toString() === id
      );

      return macro
        ? macro.name
        : "Macro";
    }

    return showKeycodes
      ? label
      : label.replace("KC_", "");
  })();

  return (
    <button
      onClick={handleClick}
      className={`
        w-14 h-14 rounded-xl text-sm font-medium
        transition-all duration-200
        flex items-center justify-center

        ${
          isSelected
            ? `ring-2 ${theme.ring} scale-105 shadow-lg`
            : ""
        }

        ${
          label.startsWith("MACRO_")
            ? "bg-gradient-to-br from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400"
            : "bg-gray-800 hover:bg-gray-700"
        }

        active:scale-95
      `}
    >
      {displayLabel}
    </button>
  );
}

export default Key;