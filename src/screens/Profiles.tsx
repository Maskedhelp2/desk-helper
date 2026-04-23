import { useDeviceStore } from "../store/deviceStore";
import { useState } from "react";

function Profiles() {
  const {
    profiles,
    createProfile,
    loadProfile,
    deleteProfile,
    currentProfile,
    exportProfile,
    importProfile,
  } = useDeviceStore();

  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");

  return (
    <div>
      <h1 className="text-2xl mb-6">Profiles</h1>

      {/* Export */}
      <button
        className="bg-yellow-500 px-4 py-2 rounded mb-4 text-black"
        onClick={exportProfile}
      >
        Export Current Profile
      </button>

      {/* Import */}
      <input
        type="file"
        accept=".json"
        className="mb-6 block"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const reader = new FileReader();

          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target?.result as string);

              if (!data.name || !data.keymaps) {
                throw new Error();
              }

              importProfile(data);
              setError("");
            } catch {
              setError("Invalid profile file");
            }
          };

          reader.readAsText(file);
        }}
      />

      {/* Error */}
      {error && (
        <p className="text-red-400 mb-4">{error}</p>
      )}

      {/* Create Profile */}
      <div className="mb-6 flex gap-2">
        <input
          className="p-2 bg-gray-700 rounded text-white"
          placeholder="Profile name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <button
          className="bg-blue-500 px-4 py-2 rounded"
          onClick={() => {
            if (!newName.trim()) return;

            if (profiles.some((p) => p.name === newName)) {
              setError("Profile name already exists");
              return;
            }

            createProfile(newName);
            setNewName("");
            setError("");
          }}
        >
          Create
        </button>
      </div>

      {/* Profile List */}
      <div className="grid gap-3">
        {profiles.map((profile) => (
          <div
            key={profile.name}
            className="bg-gray-800 p-4 rounded flex justify-between items-center"
          >
            <span>
              {profile.name}
              {profile.name === currentProfile && " (Active)"}
            </span>

            <div className="flex gap-2">
              <button
                className="bg-green-500 px-3 py-1 rounded"
                onClick={() => loadProfile(profile.name)}
              >
                Load
              </button>

              <button
                className="bg-red-500 px-3 py-1 rounded"
                onClick={() => {
                  if (profile.name === currentProfile) {
                    setError("Cannot delete active profile");
                    return;
                  }

                  if (confirm("Delete this profile?")) {
                    deleteProfile(profile.name);
                    setError("");
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profiles;