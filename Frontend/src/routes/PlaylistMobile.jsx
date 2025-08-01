import { useEffect, useState } from 'react';
import { makeAuthenticatedGETRequest } from '../utils/ServerHelpers'
import LoggedInContainer from '../containers/LoggedInContainer';
import PlaylistCard from '../components/PlaylistCard';
import CreatePlaylistModel from '../models/CreatePlaylistModel';

function PlaylistMobile() {
    const [playlists, setplaylists] = useState([]);
    const [createPlaylistModal, setCreatePlaylistModal] = useState(false)
    const getPlaylists = async () => {
        const responce = await makeAuthenticatedGETRequest("/playlist/me");
        setplaylists(responce.data)
    }
    useEffect(() => {
        getPlaylists();
    }, [])

    return (
        <LoggedInContainer curActiveScreen={"library"} >
            <CreatePlaylistModel
                show={createPlaylistModal}
                fetchPlaylists={getPlaylists}
                onClose={() => setCreatePlaylistModal(false)}
            />
            <div className='p-8'>
                <div className='text-white text-xl font-semibold pb-4 pl-2'>Your Library</div>
                <div className='space-y-3 overflow-auto'>
                    {playlists.length > 0 ? (playlists.map((item) => {
                        return <PlaylistCard
                            key={item._id}
                            playlistId={item._id}
                            title={item.name}
                            description={item.description}
                            owner={item.owner}
                            imgUrl={item.thumbnail}
                        />
                    })
                    ) : (
                        <div className="bg-[#1f1f1f] m-3 p-4 rounded-xl">
                            <div className="font-bold mb-2">Create your first playlist</div>
                            <div className="text-sm text-gray-400 mb-4">It's easy, we'll help you</div>
                            <button
                                className="bg-white text-black rounded-full px-4 py-2 font-bold hover:scale-105 transition-transform"
                                onClick={() => setCreatePlaylistModal(true)}
                            >
                                Create Playlist
                            </button>
                        </div>
                    )}
                    <div className="flex justify-center">
                    <button
                        className="bg-white text-black rounded-full px-4 py-2 font-bold"
                        onClick={() => setCreatePlaylistModal(true)}
                    >
                        Create New Playlist
                    </button>
                    </div>
                </div>
            </div>
        </LoggedInContainer>
    )
}


export default PlaylistMobile;
