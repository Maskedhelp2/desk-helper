import { useState, useEffect } from "react";
import { useDeviceStore } from "../store/deviceStore";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";


// 🔹 DRAGGABLE STEP COMPONENT
function DraggableStep({ step, index, removeStep }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: index.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded cursor-grab active:cursor-grabbing transition-all duration-200"
    >
      <span>
        {step.type === "delay"
          ? `Delay: ${step.ms}ms`
          : `${step.type}: ${step.key}`}
      </span>

      <button
        onClick={() => removeStep(index)}
        className="text-red-400"
      >
        ✕
      </button>
    </div>
  );
}


function Macros() {
  const {
    macros,
    selectedMacroId,
    addMacro,
    selectMacro,
    addStep,
    removeStep,
    reorderSteps,
    toggleRepeat,
    setDelayBetween,
  } = useDeviceStore();

  const [isRecording, setIsRecording] = useState(false);

  const currentMacro = macros.find((m) => m.id === selectedMacroId);

  // 🎙️ RECORD MODE
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isRecording) return;
      const key = `KC_${e.key.toUpperCase()}`;
      addStep({ type: "key", key });
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRecording]);

  return (
    <div className="flex h-full gap-6">

      {/* LEFT PANEL */}
      <div className="w-64 bg-gray-800 rounded-xl p-4 space-y-3">
        <button
          onClick={addMacro}
          className="w-full bg-blue-500 py-2 rounded"
        >
          + New Macro
        </button>

        {macros.map((m) => (
          <div
            key={m.id}
            onClick={() => selectMacro(m.id)}
            className={`p-2 rounded cursor-pointer ${
              selectedMacroId === m.id
                ? "bg-blue-500"
                : "bg-gray-700"
            }`}
          >
            {m.name} ({m.steps.length})
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-gray-900 rounded-xl p-6 space-y-6">

        {!currentMacro ? (
          <p>Select a macro</p>
        ) : (
          <>
            {/* 🎙 RECORD BUTTON */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`w-16 h-16 rounded-full ${
                  isRecording
                    ? "bg-red-600 animate-pulse"
                    : "bg-gray-700"
                }`}
              />
              <span>
                {isRecording ? "Recording..." : "Record"}
              </span>
            </div>

            {/* ➕ ADD STEP */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  addStep({ type: "key", key: "KC_A" })
                }
                className="bg-gray-700 px-3 py-1 rounded"
              >
                Key Press
              </button>

              <button
                onClick={() =>
                  addStep({ type: "keydown", key: "KC_A" })
                }
                className="bg-gray-700 px-3 py-1 rounded"
              >
                Key Down
              </button>

              <button
                onClick={() =>
                  addStep({ type: "keyup", key: "KC_A" })
                }
                className="bg-gray-700 px-3 py-1 rounded"
              >
                Key Up
              </button>

              <button
                onClick={() =>
                  addStep({ type: "delay", ms: 100 })
                }
                className="bg-gray-700 px-3 py-1 rounded"
              >
                Delay
              </button>
            </div>

            {/* 📋 DRAGGABLE STEPS LIST */}
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={(event) => {
                const { active, over } = event;

                if (!over || active.id === over.id) return;

                const oldIndex = Number(active.id);
                const newIndex = Number(over.id);

                reorderSteps(oldIndex, newIndex);
              }}
            >
              <SortableContext
                items={currentMacro.steps.map((_, i) =>
                  i.toString()
                )}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {currentMacro.steps.map((step, i) => (
                    <DraggableStep
                      key={i}
                      index={i}
                      step={step}
                      removeStep={removeStep}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* ⚙️ BOTTOM SETTINGS */}
            <div className="flex items-center gap-4 mt-4">
              <label className="flex gap-2 items-center">
                <input
                  type="checkbox"
                  checked={currentMacro.repeat}
                  onChange={toggleRepeat}
                />
                Repeat while held
              </label>

              <input
                type="number"
                value={currentMacro.delayBetween}
                onChange={(e) =>
                  setDelayBetween(Number(e.target.value))
                }
                className="w-24 bg-gray-700 p-1 rounded"
                placeholder="Delay ms"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Macros;