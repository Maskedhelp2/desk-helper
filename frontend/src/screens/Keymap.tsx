import { useDeviceStore } from "../store/deviceStore";
import Key from "../components/Key";

function Keymap() {
  const { keymaps, currentLayer } = useDeviceStore();
  const keymap = keymaps[currentLayer];

  return (
    <div className="flex justify-center items-center relative z-10">


      <div className="flex flex-col gap-4">

        {/* ROW 1 (top - narrow) */}
        <div className="flex gap-3 translate-x-6">
          {[0, 1, 2, 3].map((i) => (
            <Key key={i} label={keymap[i] || "KC_NO"} index={i} />
          ))}
        </div>

        {/* ROW 2 */}
        <div className="flex gap-3 translate-x-2">
          {[4, 5, 6, 7].map((i) => (
            <Key key={i} label={keymap[i] || "KC_NO"} index={i} />
          ))}
        </div>

        {/* ROW 3 (widest - center of arc) */}
        <div className="flex gap-3 -translate-x-4">
          {[8, 9, 10].map((i) => (
            <Key key={i} label={keymap[i] || "KC_NO"} index={i} />
          ))}
        </div>

        {/* ROW 4 */}
        <div className="flex gap-3 translate-x-2">
          {[11, 12, 13, 14].map((i) => (
            <Key key={i} label={keymap[i] || "KC_NO"} index={i} />
          ))}
        </div>

        {/* ROW 5 (bottom - narrow again) */}
        <div className="flex gap-4 translate-x-6">
          {[15, 16, 17].map((i) => (
            <Key key={i} label={keymap[i] || "KC_NO"} index={i} />
          ))}
        </div>

      </div>

    </div>
  );
}

export default Keymap;