import { useDeviceStore } from "../store/deviceStore";
import Key from "../components/Key";

function Keymap() {
  const { keymaps, currentLayer, selectedKey } = useDeviceStore();
  const keymap = keymaps[currentLayer];

  return (
    <div className="flex h-full">

      {/* LEFT: Keymap */}
      <div className="flex-1 flex items-center justify-center">

        <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
          <div className="grid grid-cols-4 gap-4">
            {keymap.map((key, index) => (
              <Key key={index} label={key} index={index} />
            ))}
          </div>
        </div>

      </div>

      {/* RIGHT: Empty State (center message like design) */}
      {selectedKey === null && (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-4">🖱️</div>
            <p className="text-lg">Select a key</p>
            <p className="text-sm mt-2">
              Click on any key to configure it
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

export default Keymap;