import { useDeviceStore } from "../store/deviceStore";

type KeyProps = {
  label: string;
  index: number;
};

function Key({ label, index }: KeyProps) {
  const { selectedKey, setSelectedKey } = useDeviceStore();

  const isSelected = selectedKey === index;

  return (
    <div
      onClick={() => setSelectedKey(index)}
      className={`w-full h-16 rounded-lg flex items-center justify-center cursor-pointer
        ${isSelected ? "bg-blue-500" : "bg-gray-700 hover:bg-gray-600"}
      `}
    >
      {label}
    </div>
  );
}

export default Key;