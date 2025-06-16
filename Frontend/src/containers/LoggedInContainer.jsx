import '../routes/Home.css';
import { useContext, useEffect, useLayoutEffect, useRef, useState} from 'react';
import { Howl, Howler } from 'howler';
import { Link, useNavigate } from "react-router-dom";
import { Icon } from '@iconify/react';
import songContext from '../contexts/songContext.js';
import IconText from '../components/IconText.jsx';
import { SearchContext } from '../contexts/SearchContext.jsx';
import { makeAuthenticatedGETRequest, makeAuthenticatedPOSTRequest } from '../utils/serverHelpers.js';
import PlaylistCard from '../components/PlaylistCard.jsx';
import CreatePlayListModel from '../models/CreatePlaylistModel.jsx';
import AddToPlaylistModel from '../models/AddToPlaylistModel.jsx';

function LoggedInContainer({ children, curActiveScreen, searchInputRef }) {
  const { currentSong, setCurrentSong, isPaused, setIsPaused, soundPlayed, setSoundPlayed , playlist,
  setPlaylist,} = useContext(songContext);
  const { searchValue, setSearchValue } = useContext(SearchContext);
  const [UserPlaylists, setUserPlaylists] = useState([]);
  const [createPlaylistModal, setCreatePlaylistModal] = useState(false);
  const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const firstupdate = useRef(true);

  useLayoutEffect(() => {
    if (firstupdate.current) {
      firstupdate.current = false;
      return;
    }
    if (!currentSong) return;
    changeSong(currentSong.track);
  }, [currentSong && currentSong.track]);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const addSongToPlaylist = async (playlistId) => {
    const songId = currentSong._id;
    const payload = { playlistId, songId, currentSong };
    const response = await makeAuthenticatedPOSTRequest("/playlist/add/song", payload);
    if (response._id) {
      setAddToPlaylistModalOpen(false);
      alert("Song added to playlist successfully!");
    }
  };

  const playSound = (songSrc) => {
    if (!soundPlayed) return;
    soundPlayed.play();
  };

  const changeSong = (songSrc) => {
    if (soundPlayed) {
      soundPlayed.stop();
    }
    const sound = new Howl({
    src: [songSrc],
    html5: true,
    onend: () => {
      // Auto play next song when current ends
      const index = playlist.findIndex((s) => s._id === currentSong._id);
      if (index !== -1 && index < playlist.length - 1) {
        const nextSong = playlist[index + 1];
        setCurrentSong(nextSong);
      }
    },
  });
    setSoundPlayed(sound);
    sound.play();
    setIsPaused(false);
    console.log("Playing song:", currentSong);
  };

  const pauseSound = () => {
    soundPlayed.pause();
  };

  const togglePlayPause = () => {
    if (isPaused) {
      playSound(currentSong.url);
      setIsPaused(false);
    } else {
      pauseSound();
      setIsPaused(true);
    }
  };

  const navigate = useNavigate();
  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
    if (e.target.value.trim() === "") {
      if (curActiveScreen !== "home") navigate("/home", { replace: true });
    } else {
      if (curActiveScreen !== "search") navigate("/search", { replace: true });
    }
  };

  const fetchPlaylists = async () => {
    try {
      const response = await makeAuthenticatedGETRequest("/playlist/me");
      if (!response) throw new Error('Error fetching playlists');
      setUserPlaylists(response.data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  return (
    <>
      <div className="bg-black text-white w-full min-h-screen flex flex-col">
        <CreatePlayListModel
          show={createPlaylistModal}
          onClose={() => setCreatePlaylistModal(false)}
          fetchPlaylists={fetchPlaylists}
          selectedSong={currentSong}
        />
        <AddToPlaylistModel
          show={addToPlaylistModalOpen}
          onClose={() => setAddToPlaylistModalOpen(false)}
          onAdd={(playlistId) => addSongToPlaylist(playlistId)}
          selectedSong={currentSong}
        />

        {/* Mobile Top Bar */}
        <div className="sm:hidden flex items-center justify-between px-4 py-3 bg-black sticky top-0 z-40">
          <Icon icon="logos:spotify-icon" width="40" />
          <div className="flex-1 mx-3 relative">
            <Icon icon="ei:search" width="20" className="absolute left-3 top-3 text-gray-400" />
            <input
              ref={searchInputRef}
              onChange={handleInputChange}
              value={searchValue}
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 rounded-2xl bg-[#1f1f1f] text-white text-sm w-full outline-none"
            />
          </div>
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)} 
            className="text-white p-2"
            aria-label={showMobileMenu ? "Close menu" : "Open menu"}
          >
            <Icon icon={showMobileMenu ? "material-symbols:close" : "material-symbols:menu"} width="30" />
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="sm:hidden fixed inset-0 z-50 bg-black bg-opacity-90">
            <div className="bg-[#121212] p-6 h-full overflow-y-auto">
              <div className="flex flex-col space-y-6">
                <Link to="/home" className="flex items-center py-2" onClick={() => setShowMobileMenu(false)}>
                  <Icon icon="material-symbols-light:home" width="24" className="mr-4" />
                  <span className="text-lg">Home</span>
                </Link>
                <Link to="/myMusic" className="flex items-center py-2" onClick={() => setShowMobileMenu(false)}>
                  <Icon icon="lucide:music" width="24" className="mr-4" />
                  <span className="text-lg">My Music</span>
                </Link>
                <div className="flex items-center py-2">
                  <Icon icon="bx:library" width="24" className="mr-4" />
                  <span className="text-lg">Your Library</span>
                </div>
                <div 
                  className="flex items-center py-2 cursor-pointer" 
                  onClick={() => { setCreatePlaylistModal(true); setShowMobileMenu(false); }}
                >
                  <Icon icon="material-symbols:add" width="24" className="mr-4" />
                  <span className="text-lg">Create Playlist</span>
                </div>
                <Link to="/uploadSong" className="flex items-center py-2" onClick={() => setShowMobileMenu(false)}>
                  <Icon icon="material-symbols:upload" width="24" className="mr-4" />
                  <span className="text-lg">Upload Song</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Navbar */}
        <nav className="hidden sm:flex items-center p-4 bg-black w-full top-0 left-0 right-0 z-50">
          <Icon icon="logos:spotify-icon" width="40" className="mr-4" />
          <div className="flex items-center flex-grow">
            <Link to="/home" className="mr-4">
              <div className="h-[40px] w-[40px] rounded-full bg-[#1f1f1f] flex items-center justify-center">
                <Icon icon="material-symbols-light:home" width="24" />
              </div>
            </Link>
            <div className="relative flex-grow max-w-xl">
              <Icon icon="ei:search" width="20" className="absolute left-3 top-3 text-gray-400" />
              <input
                ref={searchInputRef}
                onChange={handleInputChange}
                value={searchValue}
                type="text"
                placeholder="What do you want to play?"
                className="w-full bg-[#1f1f1f] h-10 rounded-2xl pl-10 text-white border-none outline-none"
              />
            </div>
          </div>
          <div className="hidden md:flex text-white items-center ml-auto">
            <div className="flex space-x-4 text-sm">
              <span className="cursor-pointer opacity-70 hover:opacity-100">Premium</span>
              <span className="cursor-pointer opacity-70 hover:opacity-100">Support</span>
              <span className="cursor-pointer opacity-70 hover:opacity-100">Download</span>
              <div className="h-5 w-px bg-gray-600 mx-2"></div>
              <span className="cursor-pointer opacity-70 hover:opacity-100">Install App</span>
              <span className="cursor-pointer opacity-70 hover:opacity-100">
                <Link to="/uploadSong">Upload Song</Link>
              </span>
            </div>
              <div className="bg-white text-black rounded-full w-8 h-8 flex items-center justify-center ml-2">
                <span className="font-semibold text-xs">SM</span>
              </div>
          </div>
        </nav>

        {/* Content Layout */}
        <div className="flex flex-col sm:flex-row flex-1 pb-24 sm:pb-0">
          {/* Sidebar - Fixed height with overflow handling */}
          <div className={`${showMobileMenu ? 'block' : 'hidden'} sm:block sm:w-64 min-h-[calc(100vh-140px)] bg-[#121212] rounded-lg m-2 overflow-hidden flex flex-col`}>
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <div className="flex items-center">
                <Icon icon="bx:library" width="22" className="mr-2" />
                <span className="font-medium">Your Library</span>
              </div>
              <button 
                onClick={() => setCreatePlaylistModal(true)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#2a2a2a]"
                aria-label="Create playlist"
              >
                <Icon icon="material-symbols:add" width="22" />
              </button>
            </div>
            
            {/* Playlist Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-2 hide-scrollbar">
              {UserPlaylists.length > 0 ? (
                <div className="space-y-2 px-2">
                  {UserPlaylists.map((item) => (
                    <PlaylistCard 
                      key={item._id} 
                      playlistId={item._id} 
                      title={item.name} 
                      description={item.description} 
                      owner={item.owner} 
                      imgUrl={item.thumbnail} 
                    />
                  ))}
                </div>
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
              
              <div className="mt-4">
                <IconText 
                  iconName={"lucide:music"} 
                  displayText={"My Music"} 
                  targetLink="/myMusic" 
                  active={curActiveScreen === "myMusic"} 
                />
              </div>
              
              <div className="bg-[#1f1f1f] m-3 p-4 rounded-xl">
                <div className="font-bold mb-2">Find podcasts</div>
                <div className="text-sm text-gray-400 mb-4">We'll keep you updated</div>
                <button className="bg-white text-black rounded-full px-4 py-2 font-bold hover:scale-105 transition-transform">
                  Browse podcasts
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow min-h-[calc(100vh-140px)] overflow-auto bg-gradient-to-b from-[#1f1f1f] to-[#121212] rounded-lg m-2 sm:m-2 sm:ml-0 pb-20 sm:pb-0">
            {children}
          </div>
        </div>
      </div>

      {/* Bottom Song Player - Improved responsive layout */}
      {currentSong && (
        <div className='fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#1f1f1f] to-[#121212] text-white z-50 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between px-4 py-3'>
          {/* Song Info */}
          <div className='flex items-center w-full sm:w-1/4 mb-2 sm:mb-0'>
            <img
              src={currentSong.thumbnail || currentSong.image[2]?.url}
              alt='currentSongThumbnail'
              className='h-12 w-12 rounded mr-3'
            />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{currentSong.name}</div>
              <div className="text-xs text-gray-400 truncate">
                {currentSong?.artistName}
              </div>
            </div>
          </div>

          {/* Player Controls - Centered with responsive spacing */}
          <div className='flex justify-center items-center w-full sm:w-2/4 my-2 sm:my-0'>
            <div className='flex items-center justify-center space-x-4 sm:space-x-6'>
              <Icon icon="fluent:arrow-shuffle-16-filled" width="20" className="cursor-pointer text-gray-500 hover:text-white" />
              <Icon icon="material-symbols:skip-previous-rounded" width="24" className="cursor-pointer text-gray-500 hover:text-white" />
              <Icon
                icon={isPaused ? "ic:baseline-play-circle" : "ic:baseline-pause-circle"}
                width="36"
                className="cursor-pointer text-white hover:scale-105 transition-transform"
                onClick={togglePlayPause}
              />
              <Icon icon="material-symbols:skip-next-rounded" width="24" className="cursor-pointer text-gray-500 hover:text-white" />
              <Icon icon="fad:repeat" width="20" className="cursor-pointer text-gray-500 hover:text-white" />
            </div>
          </div>

          {/* Additional Controls - Right-aligned */}
          <div className='flex justify-end items-center w-full sm:w-1/4 mt-2 sm:mt-0'>
            <div className="flex space-x-4">
              <Icon
                icon="material-symbols:playlist-add"
                width="24"
                className="cursor-pointer text-gray-500 hover:text-white"
                onClick={() => setAddToPlaylistModalOpen(true)}
              />
              <Icon
                icon={currentSong.liked ? "fluent:heart-20-filled" : "fluent:heart-20-regular"}
                width="24"
                className={`cursor-pointer ${currentSong.liked ? "text-green-500" : "text-gray-500"} hover:text-white`}
              />
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default LoggedInContainer;
