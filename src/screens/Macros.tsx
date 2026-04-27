import { useDeviceStore } from "../store/deviceStore";

function Macros() {
  const {
    macros,
    selectedMacro,
    addMacro,
    deleteMacro,
    selectMacro,
    addStep,
    removeStep,
  } = useDeviceStore();

  const currentMacro = macros.find((m) => m.id === selectedMacro);

  return (
    <div className="flex h-full gap-4">

      {/* ================= LEFT PANEL ================= */}
      <div className="w-1/3 bg-gray-800 p-4 rounded">
        <h2 className="text-lg font-bold mb-4">Macros</h2>

        <button
          onClick={addMacro}
          className="w-full bg-blue-500 hover:bg-blue-600 p-2 rounded mb-4"
        >
          + New Macro
        </button>

        {macros.length === 0 && (
          <p className="text-gray-400 text-sm">
            No macros yet
          </p>
        )}

        {macros.map((macro) => (
          <div
            key={macro.id}
            onClick={() => selectMacro(macro.id)}
            className={`p-3 mb-2 rounded cursor-pointer transition
              ${
                selectedMacro === macro.id
                  ? "bg-blue-600"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{macro.name}</span>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // 🔥 IMPORTANT
                  deleteMacro(macro.id);
                }}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300">
              {macro.steps.length} steps
            </p>
          </div>
        ))}
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="flex-1 bg-gray-800 p-4 rounded">
        {!currentMacro ? (
          <div className="text-gray-400">
            Select a macro to edit
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-4">
              {currentMacro.name}
            </h2>

            {/* ===== ADD STEP BUTTONS ===== */}
            <div className="flex gap-3 mb-4">
              <button
                onClick={() =>
                  addStep({ type: "key", key: "KC_A" })
                }
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
              >
                Add Key
              </button>

              <button
                onClick={() =>
                  addStep({ type: "delay", ms: 100 })
                }
                className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded"
              >
                Add Delay
              </button>
            </div>

            {/* ===== STEPS LIST ===== */}
            <div className="flex flex-col gap-2">
              {currentMacro.steps.length === 0 && (
                <p className="text-gray-400 text-sm">
                  No steps yet
                </p>
              )}

              {currentMacro.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-gray-700 p-3 rounded"
                >
                  <span>
                    {step.type === "key"
                      ? `Key: ${step.key}`
                      : `Delay: ${step.ms} ms`}
                  </span>

                  <button
                    onClick={() => removeStep(index)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Macros;