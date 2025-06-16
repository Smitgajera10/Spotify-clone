import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { makeAuthenticatedGETRequest, makeAuthenticatedPOSTRequest } from '../utils/ServerHelpers';

function AddToPlaylistModel({ show, onClose, onAdd, selectedSong }) {
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [showAlreadyModal, setShowAlreadyModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    if (!show) return;
    const getData = async () => {
      const response = await makeAuthenticatedGETRequest('/playlist/me');
      setMyPlaylists(response.data || []);
    };
    getData();
  }, [show]);

  const refreshPlaylists = async () => {
    const response = await makeAuthenticatedGETRequest('/playlist/me');
    setMyPlaylists(response.data || []);
  };

  const handlePlaylistClick = (playlist) => {
  if (!selectedSong || !selectedSong._id) return;

  const isSongPresent = playlist.songs?.find(song => song.track === selectedSong.track);


  if (isSongPresent) {
    setSelectedPlaylist(playlist);
    setShowAlreadyModal(true);
  } else {
    onAdd(playlist._id);
    onClose();
  }
};


  const handleAddAnyway = () => {
    if (selectedPlaylist) {
      onAdd(selectedPlaylist._id);
    }
    setShowAlreadyModal(false);
    onClose();
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await makeAuthenticatedPOSTRequest('/playlist/create', { name: newPlaylistName });
    setNewPlaylistName('');
    setCreatingNew(false);
    await refreshPlaylists();
  };

  if (!show) return null;

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
        <div className="bg-[#181818] text-white rounded-xl w-[90%] max-w-md shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Select Playlist</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button>
          </div>

          {myPlaylists.length === 0 ? (
            <p className="text-gray-400">No playlists available.</p>
          ) : (
            <ul className="space-y-2">
              {myPlaylists.map((playlist) => {
                const imgUrl = playlist.thumbnail;
                return (
                  <li
                    key={playlist._id}
                    className="flex items-center bg-[#2a2a2a] p-2 rounded-lg hover:bg-[#333] cursor-pointer"
                    onClick={() => handlePlaylistClick(playlist)}
                  >
                    {imgUrl ? (
                      <img src={imgUrl} alt="playlist" className="w-12 h-12 rounded-md object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-black/30 rounded-md flex items-center justify-center">
                        <Icon icon="mdi:playlist-music" className="text-white text-xl" />
                      </div>
                    )}
                    <div className="ml-3">
                      <div className="font-medium">{playlist.name}</div>
                      <div className="text-sm text-gray-400">{playlist.songs?.length || 0} songs</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {creatingNew ? (
            <div className="mt-4">
              <input
                type="text"
                placeholder="New playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full p-2 rounded bg-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex justify-end mt-2 space-x-2">
                <button onClick={() => setCreatingNew(false)} className="px-3 py-1 rounded bg-gray-600 hover:bg-gray-700 text-sm">
                  Cancel
                </button>
                <button onClick={handleCreatePlaylist} className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-sm">
                  Create
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mt-4">
              <button onClick={() => setCreatingNew(true)} className="px-4 py-2 text-sm bg-green-500 hover:bg-green-600 rounded">
                + Create Playlist
              </button>
            </div>
          )}

          <div className="mt-4 text-right">
            <button onClick={onClose} className="text-sm text-gray-400 hover:text-white">Close</button>
          </div>
        </div>
      </div>

      {/* Duplicate Song Modal */}
      {showAlreadyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#181818] text-white rounded-xl w-[90%] max-w-sm shadow-lg p-6 text-center">
            <h3 className="text-lg font-semibold">Already added</h3>
            <p className="text-gray-400 mt-2">
              This song is already in your <span className="font-semibold">{selectedPlaylist?.name}</span> playlist.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <button onClick={handleAddAnyway} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-sm">
                Add anyway
              </button>
              <button onClick={() => setShowAlreadyModal(false)} className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-sm">
                Don’t add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddToPlaylistModel;
