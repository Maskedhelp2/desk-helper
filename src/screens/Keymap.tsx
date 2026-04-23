import { useDeviceStore } from "../store/deviceStore";
import Key from "../components/Key";

function Keymap() {
  const { keymaps, currentLayer } = useDeviceStore();
  const keymap = keymaps[currentLayer];

  return (
    <div>
      <h1 className="text-2xl mb-6">Keymap</h1>

      <div className="grid grid-cols-4 gap-2 w-fit">

        {/* Row 1 */}
        <Key label={keymap[0]} index={0} />
        <Key label={keymap[1]} index={1} />
        <Key label={keymap[2]} index={2} />
        <Key label={keymap[3]} index={3} />

        {/* Row 2 */}
        <Key label={keymap[4]} index={4} />
        <Key label={keymap[5]} index={5} />
        <Key label={keymap[6]} index={6} />
        <Key label={keymap[7]} index={7} />

        {/* Row 3 */}
        <Key label={keymap[8]} index={8} />
        <Key label={keymap[9]} index={9} />
        <Key label={keymap[10]} index={10} />
        <Key label={keymap[11]} index={11} />

        {/* Row 4 */}
        <Key label={keymap[12]} index={12} />
        <Key label={keymap[13]} index={13} />
        <Key label={keymap[14]} index={14} />

        {/* Enter (spans 2 rows) */}
        <div className="row-span-2">
          <Key label={keymap[15]} index={15} />
        </div>

        {/* Bottom Row */}
        <div className="col-span-2">
          <Key label={keymap[16]} index={16} />
        </div>

        <Key label={"."} index={16} />
      </div>
    </div>
  );
}

export default Keymap;