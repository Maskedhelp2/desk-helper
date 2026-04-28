import { useDeviceStore } from "./store/deviceStore";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { keyCategories } from "./data/keyCategories";
import { useState } from "react";

import Keymap from "./screens/Keymap";
import Encoder from "./screens/Encoder";
import OLED from "./screens/OLED";
import Macros from "./screens/Macros";
import Profiles from "./screens/Profiles";
import Firmware from "./screens/Firmware";

function App() {
  const location = useLocation();

  const isMacrosPage = location.pathname === "/macros";
  const isFirmwarePage = location.pathname === "/firmware";

  const store = useDeviceStore();

  const {
    currentLayer,
    selectedKey,
    keymaps,
    setKey,
    setLayer,
    connected,
    currentProfile,
    profiles, // ✅ added (NO logic change, just reading)
  } = store;

  // ✅ FIX: get profile name from ID
  const profileObj = profiles.find((p) => p.id === currentProfile);
  const profileName = profileObj?.name || currentProfile;

  // ✅ SAFE FALLBACKS
  const layers = (store as any).layers || ["Layer 0", "Layer 1", "Layer 2", "Layer 3"];
  const hasUnsavedChanges = (store as any).hasUnsavedChanges || false;
  const saveChanges = (store as any).saveChanges || (() => {});
  const toggleConnection = (store as any).toggleConnection || (() => {});
  const resetLayer = (store as any).resetLayer || (() => {});

  const keymap = keymaps[currentLayer] || [];

  const selectedValue =
    selectedKey !== null ? keymap[selectedKey] || "KC_NO" : undefined;

  const [activeTab, setActiveTab] =
    useState<keyof typeof keyCategories>("standard");

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const menuItems = [
    { name: "Keymap", path: "/" },
    { name: "Encoder", path: "/encoder" },
    { name: "OLED", path: "/oled" },
    { name: "Macros", path: "/macros" },
    { name: "Profiles", path: "/profiles" },
    { name: "Firmware", path: "/firmware" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">

      {/* SIDEBAR */}
      <div className="w-64 bg-gray-800 p-5 flex flex-col justify-between">
        <div>
          <h1 className="text-lg font-bold mb-6">Numpad Configurator</h1>

          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <li key={item.name}>
                  <Link to={item.path}>
                    <div
                      className={`px-3 py-2 rounded-lg cursor-pointer ${
                        isActive
                          ? "bg-blue-500"
                          : "hover:bg-gray-700 text-gray-300"
                      }`}
                    >
                      {item.name}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="bg-gray-700 p-3 rounded-lg text-sm">
          <p className="text-green-400">● Connected</p>
          <p className="text-gray-400 mt-1">Firmware v1.0</p>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 px-6 pb-6 flex flex-col gap-6">

        {/* TOP BAR */}
        <div className="h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>{connected ? "Device Connected" : "Disconnected"}</span>

            <button
              onClick={toggleConnection}
              className="bg-gray-700 px-2 py-1 rounded text-sm"
            >
              {connected ? "Disconnect" : "Connect"}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* ✅ FIX APPLIED HERE */}
            <span>Profile: {profileName}</span>

            <span>Layer: {currentLayer}</span>

            {hasUnsavedChanges && (
              <span className="text-yellow-400 text-sm animate-pulse">
                ● Unsaved Changes
              </span>
            )}

            <button
              onClick={saveChanges}
              className={`px-3 py-1 rounded ${
                hasUnsavedChanges ? "bg-blue-500" : "bg-gray-600"
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* LAYERS */}
        <div className="flex gap-3 items-center">
          {layers.map((layer: string, i: number) => (
            <button
              key={i}
              onClick={() => setLayer(i)}
              className={`px-4 py-1 rounded ${
                currentLayer === i
                  ? "bg-blue-500"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {layer}
            </button>
          ))}

          <button
            onClick={() => setShowResetConfirm(true)}
            className="ml-4 px-3 py-1 bg-red-600 rounded text-sm"
          >
            Reset Layer
          </button>
        </div>

        {/* FULL SCREEN PAGES */}
        {isMacrosPage || isFirmwarePage ? (
          <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6">
            <Routes>
              <Route path="/macros" element={<Macros />} />
              <Route path="/firmware" element={<Firmware />} />
            </Routes>
          </div>
        ) : (
          <div className="flex gap-6 flex-1">

            {/* LEFT */}
            <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 relative z-10">
              <h2 className="text-lg font-semibold mb-4">Editor</h2>

              <Routes>
                <Route path="/" element={<Keymap />} />
                <Route path="/encoder" element={<Encoder />} />
                <Route path="/oled" element={<OLED />} />
                <Route path="/profiles" element={<Profiles />} />
              </Routes>
            </div>

            {/* CENTER */}
            <div className="flex-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg flex flex-col justify-center items-center p-6 relative z-10">
              {selectedKey === null ? (
                <>
                  <div className="text-5xl mb-4 opacity-50">⌨️</div>
                  <h3>No key selected</h3>
                </>
              ) : (
                <>
                  <h3 className="mb-3 text-gray-400">Selected Key</h3>

                  <div className="w-24 h-24 bg-gray-700 rounded-2xl flex items-center justify-center text-2xl mb-4">
                    {selectedValue?.replace("KC_", "")}
                  </div>

                  <div className="bg-gray-900 px-4 py-2 rounded-lg text-sm text-blue-400">
                    {selectedValue}
                  </div>
                </>
              )}
            </div>

            {/* RIGHT */}
            <div className="w-80 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg p-6 relative z-10">
              <h2 className="text-lg font-semibold mb-4">Key Settings</h2>

              {selectedKey !== null && (
                <select
                  className="w-full p-2 bg-gray-700 rounded"
                  value={selectedValue}
                  onChange={(e) =>
                    selectedKey !== null &&
                    setKey(selectedKey, e.target.value)
                  }
                >
                  {(keyCategories[activeTab] || []).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        )}

        {/* RESET MODAL */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-xl">
              <h2 className="mb-3">Reset Layer?</h2>
              <div className="flex gap-3">
                <button onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetLayer(currentLayer);
                    setShowResetConfirm(false);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;