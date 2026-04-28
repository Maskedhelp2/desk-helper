import { setKey as sendKey } from "../utils/hid/protocol";
import { useDeviceStore } from "../store/deviceStore";

type Props = {
  label: string;
  index: number;
};

function Key({ label, index }: Props) {
  const { setKey, setSelectedKey, selectedKey } = useDeviceStore();

  const { macros } = useDeviceStore();

  const handleClick = () => {
    // 1️⃣ select key
    setSelectedKey(index);

    // 3️⃣ map index → row/col
    const indexMap = [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [8, 9, 10],
      [11, 12, 13, 14],
      [15, 16, 17],
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

    const keycode = 0x04; // TEMP KC_A
    sendKey(row, col, keycode);
  };

  const isSelected = selectedKey === index;

  return (
    <button
      onClick={handleClick}
      className={`w-14 h-14 rounded-xl text-sm font-medium transition-all duration-200 
    flex items-center justify-center ${
        isSelected
          ? "ring-2 ring-blue-400 scale-105 shadow-lg"
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
      {(() => {
        if (label.startsWith("MACRO_")) {
            const id = label.replace("MACRO_", "");
            const macro = macros.find((m: any) => m.id.toString() === id);
            return macro ? macro.name : "Macro";
        }
        return label.replace("KC_", "");
    })()}
    </button>
  );
}

export default Key;