import { useDeviceStore } from "../store/deviceStore";
import { useEffect } from "react";
import {
    DndContext,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";

function DraggableStep({ step, index }: any) {
    const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
  } = useDraggable({
    id: index,
  });

  const { setNodeRef: setDropRef } = useDroppable({
    id: index,
  });

  const style = {
    transform: transform
      ? `translate(${transform.x}px, ${transform.y}px)`
      : undefined,
  };
  return (
    <div
      ref={(node) => {
        setDragRef(node);
        setDropRef(node);
      }}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-gray-700 p-3 rounded flex justify-between items-center cursor-grab"
    >
      <span>
        {step.type === "key"
          ? `Key: ${step.key}`
          : `Delay: ${step.ms} ms`}
      </span>
    </div>
  );

}

function Macros() {
  const {
    macros,
    selectedMacro,
    reorderSteps,
    addMacro,
    deleteMacro,
    selectMacro,
    addStep,
    removeStep,
    isRecording,
    startRecording,
    stopRecording,
    recordKey,
  } = useDeviceStore();

  const currentMacro = macros.find((m) => m.id === selectedMacro);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!isRecording) return;
        const key = `KC_${e.key.toUpperCase()}`;
        recordKey(key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
        window.removeEventListener("keydown", handleKeyDown);
    };
}, [isRecording]);

const { setNodeRef } = useDroppable({
    id: "drop-zone",
});

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
            <div className="flex gap-3 mb-4 items-center">
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

              {/* 🔴 RECORD BUTTON */}
              <button
                onClick={() =>
                    isRecording ? stopRecording() : startRecording()
                }
                className={`px-4 py-2 rounded ${
                    isRecording
                      ? "bg-red-600 animate-pulse"
                      : "bg-red-500 hover:bg-red-600"
                }`}
            >
                {isRecording ? "Recording..." : "Record"}
            </button>
            </div>

            {/* ===== STEPS LIST ===== */}
            <div className="flex flex-col gap-2">
              {currentMacro.steps.length === 0 && (
                <p className="text-gray-400 text-sm">
                  No steps yet
                </p>
              )}

              <DndContext
  onDragEnd={(event) => {
    const { active, over } = event;

    if (!over) return;

    const from = active.id as number;
    const to = over.id as number;

    console.log("REORDER:", from, "->", to);

    if (from !== to) {
      reorderSteps(from, to);
    }
  }}
>
  <div className="space-y-2">
    {currentMacro.steps.map((step, index) => (
      <DraggableStep key={index} step={step} index={index} />
    ))}
  </div>
</DndContext>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Macros;