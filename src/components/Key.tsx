import { useDeviceStore } from "../store/deviceStore";

type Props = {
  label: string;
  index: number;
};

function formatLabel(label: string) {
  return label
    .replace("KC_", "")
    .replace("ENTER", "Enter")
    .replace("ESC", "Esc")
    .replace("SPACE", "Space")
    .replace("BSPC", "⌫")
    .replace("TAB", "Tab");
}

function Key({ label, index }: Props) {
  const { selectedKey, setSelectedKey } = useDeviceStore();
  const isSelected = selectedKey === index;

  return (
    <div
      onClick={() => setSelectedKey(index)}
      className={`
        w-16 h-16 rounded-xl flex items-center justify-center
        text-sm font-medium cursor-pointer
        transition-all duration-200

        ${isSelected
          ? "bg-blue-500 scale-105 shadow-lg"
          : "bg-gray-700 hover:bg-gray-600"}
      `}
    >
      {formatLabel(label)}
    </div>
  );
}

export default Key;