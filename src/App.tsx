import { useDeviceStore } from "./store/deviceStore";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { keyCategories } from "./data/keyCategories";
import { getKeyDescription } from "./utils/getKeyDescription";
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

  const {
    currentLayer,
    selectedKey,
    keymaps,
    setKey,
    setLayer,
    layers,
    hasUnsavedChanges,
    saveChanges,
    connected,
    toggleConnection,
    currentProfile,
    resetLayer,
  } = useDeviceStore();

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
    <div className="flex h-screen bg-gray-900 text-white">

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
                      className={`px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isActive
                          ? "bg-blue-500 text-white"
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
            <span>Profile: {currentProfile}</span>
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
          {layers.map((layer, i) => (
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
            className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
          >
            Reset Layer
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="flex flex-1 gap-6">

          {isMacrosPage ? (
            // ✅ MACROS FULL SCREEN
            <div className="flex-1 bg-gray-800 rounded-xl p-6">
              <Macros />
            </div>
          ) : (
            <>
              {/* LEFT PANEL */}
              <div className="flex-1 bg-gray-800 rounded-xl p-6 flex flex-col">

                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Editor</h2>
                    <p className="text-sm text-gray-400">
                      Configure your device
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">
                      Import
                    </button>
                    <button className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">
                      Export
                    </button>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <div className="bg-gray-900 p-6 rounded-xl shadow-inner w-full h-full flex items-center justify-center">
                    <Routes>
                      <Route path="/" element={<Keymap />} />
                      <Route path="/encoder" element={<Encoder />} />
                      <Route path="/oled" element={<OLED />} />
                      <Route path="/profiles" element={<Profiles />} />
                      <Route path="/firmware" element={<Firmware />} />
                    </Routes>
                  </div>
                </div>
              </div>

              {/* CENTER PANEL */}
              <div className="flex-1 bg-gray-800 rounded-xl flex flex-col justify-center items-center p-6">
                {selectedKey === null ? (
                  <>
                    <div className="text-5xl mb-4 opacity-50">⌨️</div>
                    <h3 className="text-lg font-medium">No key selected</h3>
                    <p className="text-sm text-gray-400 mt-2 text-center max-w-xs">
                      Select any key to view details
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="mb-3 text-gray-400">Selected Key</h3>

                    <div className="w-24 h-24 bg-gray-700 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md">
                      {selectedValue?.replace("KC_", "")}
                    </div>

                    <div className="bg-gray-900 px-4 py-2 rounded-lg text-sm text-blue-400">
                      {selectedValue}
                    </div>

                    <p className="text-xs text-gray-500 mt-3">
                      Active on Layer {currentLayer}
                    </p>
                  </>
                )}
              </div>

              {/* RIGHT PANEL */}
              <div className="w-80 bg-gray-800 p-6 rounded-xl">
                <h2 className="text-lg font-semibold mb-4">Key Settings</h2>

                {selectedKey !== null ? (
                  <div className="space-y-6">

                    <div className="flex gap-2">
                      {Object.keys(keyCategories).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab as any)}
                          className={`px-2 py-1 rounded ${
                            activeTab === tab
                              ? "bg-blue-500"
                              : "bg-gray-700 hover:bg-gray-600"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div>
                      <p className="text-sm text-gray-400 mb-1">Key Action</p>
                      <select
                        className="w-full p-2 bg-gray-700 rounded"
                        value={selectedValue || "KC_NO"}
                        onChange={(e) =>
                          setKey(selectedKey!, e.target.value)
                        }
                      >
                        {(keyCategories[activeTab] || []).map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <p className="text-sm text-gray-400">Description</p>
                      <p className="text-sm text-blue-400 mt-1">
                        {getKeyDescription(selectedValue)}
                      </p>
                    </div>

                  </div>
                ) : (
                  <p className="text-gray-400">Select a key</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* RESET MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-80">
            <h2 className="text-lg font-semibold mb-3">Reset Layer?</h2>
            <p className="text-sm text-gray-400 mb-5">
              This will clear all keys in current layer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1 bg-gray-600 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetLayer(currentLayer);
                  setShowResetConfirm(false);
                }}
                className="px-3 py-1 bg-red-600 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;