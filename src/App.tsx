import { useDeviceStore } from "./store/deviceStore";
import { Routes, Route, Link } from "react-router-dom";
import { keyOptions } from "./data/keyOptions";
import { useState } from "react";

import Keymap from "./screens/Keymap";
import Encoder from "./screens/Encoder";
import OLED from "./screens/OLED";
import Macros from "./screens/Macros";
import Profiles from "./screens/Profiles";
import Firmware from "./screens/Firmware";

function App() {
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
  } = useDeviceStore();

  const keymap = keymaps[currentLayer];

  const [activeTab, setActiveTab] = useState("standard");

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">

      {/* Top Bar */}
      <div className="h-12 bg-gray-800 flex items-center px-6 justify-between border-b border-gray-700">

        {/* Left: Connection */}
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>

          <span className="text-sm">
            {connected ? "Device Connected" : "Device Disconnected"}
          </span>

          <button
            onClick={toggleConnection}
            className="ml-3 px-2 py-1 text-xs bg-gray-700 rounded hover:bg-gray-600"
          >
            {connected ? "Disconnect" : "Connect"}
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Layer: {currentLayer}
          </span>

          <button
            onClick={saveChanges}
            disabled={!hasUnsavedChanges}
            className={`px-3 py-1 rounded ${
              hasUnsavedChanges
                ? "bg-yellow-500 text-black"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>

      </div>

      {/* Main Layout */}
      <div className="flex-1 flex bg-gray-900">

        {/* Sidebar */}
        <div className="w-60 bg-gray-800 p-4">
          <h2 className="text-xl font-bold mb-6">Menu</h2>
          <ul className="space-y-3">
            {[
              ["Keymap", "/"],
              ["Encoder", "/encoder"],
              ["OLED", "/oled"],
              ["Macros", "/macros"],
              ["Profiles", "/profiles"],
              ["Firmware", "/firmware"],
            ].map(([name, path]) => (
              <li key={name}>
                <Link
                  to={path}
                  className="block px-3 py-2 rounded hover:bg-gray-700 transition"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">

          {/* Left */}
          <div className="flex-1 p-6">

            {/* Layer Tabs */}
            <div className="flex gap-2 mb-4">
              {layers.map((layer, index) => (
                <button
                  key={index}
                  onClick={() => setLayer(index)}
                  className={`px-3 py-1 rounded ${
                    currentLayer === index
                      ? "bg-blue-500"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>

            {/* Routes */}
            <Routes>
              <Route path="/" element={<Keymap />} />
              <Route path="/encoder" element={<Encoder />} />
              <Route path="/oled" element={<OLED />} />
              <Route path="/macros" element={<Macros />} />
              <Route path="/profiles" element={<Profiles />} />
              <Route path="/firmware" element={<Firmware />} />
            </Routes>

          </div>

          {/* Right Panel */}
          <div className="w-80 bg-gray-800 p-6 border-l border-gray-700">

  <h2 className="text-xl font-semibold mb-4">Key Settings</h2>

  {selectedKey !== null ? (
    <div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {["standard", "media", "macro", "layer"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-sm rounded ${
              activeTab === tab
                ? "bg-blue-500"
                : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dropdown */}
      <label className="text-sm text-gray-400">Key Action</label>
      <select
        disabled={!connected}
        className="w-full mt-2 p-2 bg-gray-700 rounded text-white"
        value={keymap[selectedKey]}
        onChange={(e) => setKey(selectedKey, e.target.value)}
      >
        {keyOptions.map((key) => (
          <option key={key} value={key}>
            {key}
          </option>
        ))}
      </select>

      {/* Preview */}
      <div className="mt-6">
        <p className="text-sm text-gray-400 mb-2">Preview</p>
        <div className="w-16 h-16 bg-gray-700 rounded-xl flex items-center justify-center">
          {keymap[selectedKey].replace("KC_", "")}
        </div>
      </div>

    </div>
  ) : (
    <p className="text-gray-400">Select a key</p>
  )}

</div>


        </div>
      </div>
    </div>
  );
}

export default App;