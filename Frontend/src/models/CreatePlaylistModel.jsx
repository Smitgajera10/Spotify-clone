import { useState } from 'react';
import { makeAuthenticatedPOSTRequest } from '../utils/ServerHelpers';

function CreatePlaylistModel({ show, onClose, fetchPlaylists}) {
  const [playlistName, setPlaylistName] = useState('');
  const [description, setDescription] = useState('');

  if (!show) return null;
  const onSave = async() => {
    const playlistData = {
      name: playlistName,
      thumbnail : null,
      description: description,
      songs : [],
    };
    console.log(playlistData);
    const response = await makeAuthenticatedPOSTRequest('/playlist/create', playlistData);
    if(response._id){
        onClose();
        fetchPlaylists();
    }

  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={onClose}>
      <div className="bg-[#181818] text-white rounded-xl w-full max-w-md p-6 shadow-2xl"
           onClick={(e) => e.stopPropagation()}>  
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Playlist</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Playlist Name</label>
            <input
              type="text"
              value={playlistName}
              required
              onChange={(e) => setPlaylistName(e.target.value)}
              placeholder="My Playlist"
              className="w-full px-3 py-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your playlist"
              className="w-full px-3 py-2 rounded bg-[#2a2a2a] text-white focus:outline-none focus:ring focus:ring-green-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // TODO:
              onSave();
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-400 rounded text-black font-semibold"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePlaylistModel;
