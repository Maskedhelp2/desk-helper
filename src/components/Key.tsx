import { setKey as sendKey } from "../utils/hid/protocol";
import { useDeviceStore } from "../store/deviceStore";

type Props = {
  label: string;
  index: number;
};

function Key({ label, index }: Props) {
  const { setKey, setSelectedKey, selectedKey } = useDeviceStore();

  const handleClick = () => {
    // 1️⃣ select key
    setSelectedKey(index);

    // 2️⃣ TEMP default assign (optional)
    setKey(index, "KC_A");

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
      className={`w-14 h-14 rounded text-white
        ${isSelected ? "bg-blue-500" : "bg-gray-800 hover:bg-gray-600"}`}
    >
      {label}
    </button>
  );
}

export default Key;