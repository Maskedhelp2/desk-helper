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
      <div className="h-12 bg-gray-800 flex items-center px-4 justify-between">

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
      <div className="flex flex-1">

        {/* Sidebar */}
        <div className="w-60 bg-gray-800 p-4">
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          <ul className="space-y-2">
            <li><Link to="/">Keymap</Link></li>
            <li><Link to="/encoder">Encoder</Link></li>
            <li><Link to="/oled">OLED</Link></li>
            <li><Link to="/macros">Macros</Link></li>
            <li><Link to="/profiles">Profiles</Link></li>
            <li><Link to="/firmware">Firmware</Link></li>
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
          <div className="w-72 bg-gray-800 p-4">
            <h2 className="text-lg font-bold mb-4">Key Settings</h2>

            {selectedKey !== null ? (
              <div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                  {["standard", "media", "macro", "layer"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2 py-1 text-sm rounded ${
                        activeTab === tab
                          ? "bg-blue-500"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Standard */}
                {activeTab === "standard" && (
                  <select
                    disabled={!connected}
                    className="w-full p-2 bg-gray-700 rounded text-white"
                    value={keymap[selectedKey]}
                    onChange={(e) => setKey(selectedKey, e.target.value)}
                  >
                    {keyOptions.map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                )}

                {/* Media */}
                {activeTab === "media" && (
                  <div className="grid grid-cols-3 gap-2">
                    {["Play", "Next", "Prev", "Vol+", "Vol-", "Mute"].map((item) => (
                      <button
                        key={item}
                        disabled={!connected}
                        className="bg-gray-700 p-2 rounded hover:bg-gray-600 disabled:opacity-50"
                        onClick={() => setKey(selectedKey, item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}

                {/* Macro */}
                {activeTab === "macro" && (
                  <p className="text-gray-400">Macro feature coming soon</p>
                )}

                {/* Layer */}
                {activeTab === "layer" && (
                  <div className="flex flex-col gap-2">
                    {[0, 1, 2, 3].map((layer) => (
                      <button
                        key={layer}
                        disabled={!connected}
                        className="bg-gray-700 p-2 rounded hover:bg-gray-600 disabled:opacity-50"
                        onClick={() => setKey(selectedKey, `LAYER_${layer}`)}
                      >
                        Switch to Layer {layer}
                      </button>
                    ))}
                  </div>
                )}

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