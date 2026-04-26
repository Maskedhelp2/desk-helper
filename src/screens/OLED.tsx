import { useState } from "react";
import { useDeviceStore } from "../store/deviceStore";
import OledPreview from "../components/OledPreview";

function OLED() {
  const {
    oled,
    setOledLayout,
    setOledLogo,
    setOledProfileMode,
    setOledEffect,
  } = useDeviceStore();

  const [tab, setTab] = useState("layout");

  return (
    <div className="relative w-full max-w-lg space-y-6">

      {/* Tabs */}
      <div className="flex gap-2">
        {["layout", "logo", "profile"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded ${
              tab === t ? "bg-blue-500" : "bg-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ================= LAYOUT ================= */}
      {tab === "layout" && (
        <div className="space-y-4">

          {["A", "B", "C"].map((zone) => (
            <div key={zone}>
              <p className="text-sm text-gray-400">
                Zone {zone}
              </p>

              <select
                className="w-full p-2 bg-gray-700 rounded"
                value={oled.layout[zone as "A" | "B" | "C"]}
                onChange={(e) =>
                  setOledLayout(
                    zone as "A" | "B" | "C",
                    e.target.value
                  )
                }
              >
                <option>Layer</option>
                <option>Profile</option>
                <option>Custom</option>
                <option>Blank</option>
              </select>
            </div>
          ))}

          {/* Visual */}
          <div className="mt-6 border border-gray-600 w-[256px] h-[128px] relative bg-black text-white text-xs">
            <div className="absolute top-0 w-full h-1/2 border-b flex justify-center items-center">
              A
            </div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 border-r flex justify-center items-center">
              B
            </div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 flex justify-center items-center">
              C
            </div>
          </div>
        </div>
      )}

      {/* ================= LOGO ================= */}
      {tab === "logo" && (
        <div className="space-y-4">

          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = () =>
                setOledLogo(reader.result as string);

              reader.readAsDataURL(file);
            }}
            className="border-2 border-dashed p-6 text-center"
          >
            Drag & drop image here
          </div>

          {/* File picker */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const reader = new FileReader();
              reader.onload = () =>
                setOledLogo(reader.result as string);

              reader.readAsDataURL(file);
            }}
          />

          {/* Preview */}
          {oled.logo && (
            <img
              src={oled.logo}
              className="w-32 h-16 object-contain"
            />
          )}

          {/* 🔥 EFFECT SELECT */}
          <select
            className="w-full p-2 bg-gray-700 rounded"
            value={oled.effect}
            onChange={(e) =>
              setOledEffect(e.target.value as any)
            }
          >
            <option value="static">Static</option>
            <option value="pulse">Pulse</option>
            <option value="scroll">Scroll</option>
          </select>

        </div>
      )}

      {/* ================= PROFILE ================= */}
      {tab === "profile" && (
        <div>
          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={oled.perProfile}
              onChange={(e) =>
                setOledProfileMode(e.target.checked)
              }
            />
            Only active for this profile
          </label>
        </div>
      )}

      {/* Preview */}
      <div className="fixed bottom-6 right-6 z-50">
        <OledPreview />
      </div>

    </div>
  );
}

export default OLED;