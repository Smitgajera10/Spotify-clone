import { useState } from "react";

function SpotifyImportModal({ show, onClose, onImport }) {
  const [playlistLink, setPlaylistLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateSpotifyUrl = (url) => {
    return /^https:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+/.test(url);
  };

  const handleImport = async () => {
    if (!validateSpotifyUrl(playlistLink.trim())) {
      setError("Please enter a valid Spotify playlist link.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onImport(playlistLink.trim()); // wait for actual import
      onClose(); // close only after success
    } catch (err) {
      console.error(err);
      setError("Failed to import playlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#181818] text-white rounded-xl w-[90%] max-w-md shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Spotify Playlist</h2>
          <button onClick={loading ? null : onClose} className="text-gray-400 hover:text-white text-xl" disabled={loading}>
            &times;
          </button>
        </div>
        <p className="text-blue-500 text-sm my-2">"This feature works only for 30 or less songs. If your playlist has more then 30 songs then the first 30 songs will be added and if the song is not in database , it wouldn't add"</p>
        <label className="block text-sm mb-2 text-gray-300">Spotify Public Playlist Link</label>
        <input
          type="text"
          value={playlistLink}
          onChange={(e) => setPlaylistLink(e.target.value)}
          placeholder="https://open.spotify.com/playlist/..."
          className="w-full p-2 rounded bg-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={loading}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <p className="text-sm mt-2">It can take time upto 2 minutes</p>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-sm"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-sm flex items-center"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"
                  />
                </svg>
                Importing...
              </div>
            ) : (
              "Import"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SpotifyImportModal;
