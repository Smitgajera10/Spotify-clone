import './Home.css';
import { Link, useNavigate } from "react-router-dom";
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { makeUnauthenticatedPOSTRequest } from '../utils/ServerHelpers';

function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    // Check if mobile device
    const checkIfMobile = async() => {
      const test = await makeUnauthenticatedPOSTRequest("/");
      const userAgent = navigator.userAgent;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isMobile);
      setShowMobileWarning(isMobile);
    };

    checkIfMobile();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Updated with working image URLs
  const artists = [
    { id: 1, name: "Arijit Singh", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Arijit_5th_GiMA_Awards.jpg/500px-Arijit_5th_GiMA_Awards.jpg", type: "Artist" },
    { id: 2, name: "Ritviz", image: "https://i.scdn.co/image/ab676161000051743bc0e5f9b29553ed9d2bce18", type: "Artist" },
    { id: 3, name: "Prateek Kuhad", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Prateek_Kuhad_%28cropped%29.jpg/500px-Prateek_Kuhad_%28cropped%29.jpg", type: "Artist" },
    { id: 4, name: "Darshan Raval", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Darshan-Raval-grace-the-12th-radio-mirchi-music-awards-2020.jpg/500px-Darshan-Raval-grace-the-12th-radio-mirchi-music-awards-2020.jpg", type: "Artist" },
    { id: 5, name: "Neha Kakkar", image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Neha_Kakkar_in_January_2020.jpg", type: "Artist" },
    { id: 6, name: "A.R. Rahman", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/AR_Rahman_At_The_%E2%80%98Marvel_Anthem%E2%80%99_Launch_%283x4_cropped%29.jpg/500px-AR_Rahman_At_The_%E2%80%98Marvel_Anthem%E2%80%99_Launch_%283x4_cropped%29.jpg", type: "Artist" },
  ];

  const albums = [
    { id: 1, name: "Sanam Teri Kasam", artist: "Himesh Reshammiya", image: "https://upload.wikimedia.org/wikipedia/en/7/72/Sanam_Teri_Kasam_2016.jpeg" },
    { id: 2, name: "Aashiqui 2", artist: "Mithoon, Ankit Tiwari", image: "https://upload.wikimedia.org/wikipedia/en/f/f3/Aashiqui_2_%28Poster%29.jpg?20220808110749" },
    { id: 3, name: "Kabir Singh", artist: "Arijit Singh", image: "https://upload.wikimedia.org/wikipedia/en/d/dc/Kabir_Singh.jpg" },
    { id: 4, name: "Ludo", artist: "Pritam", image: "https://upload.wikimedia.org/wikipedia/en/a/af/Ludo_film_poster.jpg" },
    { id: 5, name: "Shershaah", artist: "Various Artists", image: "https://upload.wikimedia.org/wikipedia/en/9/91/Shershaah_film_poster.jpg" },
    { id: 6, name: "Rockstar", artist: "A.R. Rahman", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/AR_Rahman_At_The_%E2%80%98Marvel_Anthem%E2%80%99_Launch_%283x4_cropped%29.jpg/500px-AR_Rahman_At_The_%E2%80%98Marvel_Anthem%E2%80%99_Launch_%283x4_cropped%29.jpg" },
  ];

  const radios = [
    { id: 1, name: "Arijit Singh Radio", description: "With Sachin-Jigar, Vishal-Shekhar, Amit Trivedi and more", image: "https://i.scdn.co/image/ab6765630000ba8a81f07e1e031e7f69e7f9f6e5" },
    { id: 2, name: "Bollywood Hits Radio", description: "Today's top Bollywood hits", image: "https://i.scdn.co/image/ab6765630000ba8a91f07e1e031e7f69e7f9f6e6" },
    { id: 3, name: "Indie India Radio", description: "Fresh indie tracks from India", image: "https://i.scdn.co/image/ab6765630000ba8a92f07e1e031e7f69e7f9f6e7" },
  ];

  const bestOfIndia = [
    { id: 1, name: "I-Pop Hits", description: "Hottest tracks from your favorite I-Pop icons", image: "https://i.scdn.co/image/ab67706f00000002a1b1b1b1b1b1b1b1b1b1b1b" },
    { id: 2, name: "Hot Hits India", description: "India's hottest hits", image: "https://i.scdn.co/image/ab67706f00000002b1b1b1b1b1b1b1b1b1b1b1b1" },
    { id: 3, name: "Punjabi 101", description: "The ultimate Punjabi hits", image: "https://i.scdn.co/image/ab67706f00000002c1c1c1c1c1c1c1c1c1c1c1c1" },
  ];

  const dailyMixes = [
    { id: 1, name: "Daily Mix 1", description: "Made for you • Updated daily", image: "https://i.scdn.co/image/ab67706f00000002d1d1d1d1d1d1d1d1d1d1d1d1", artists: [artists[0], artists[1], artists[2], artists[3]] },
    { id: 2, name: "Daily Mix 2", description: "Made for you • Updated daily", image: "https://i.scdn.co/image/ab67706f00000002e1e1e1e1e1e1e1e1e1e1e1e1", artists: [artists[2], artists[3], artists[4], artists[5]] },
    { id: 3, name: "Daily Mix 3", description: "Made for you • Updated daily", image: "https://i.scdn.co/image/ab67706f00000002f1f1f1f1f1f1f1f1f1f1f1f1", artists: [artists[1], artists[3], artists[4], artists[0]] },
  ];

  return (
    <div className="bg-black text-white min-h-screen">

      {showMobileWarning && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 text-center">
            <Icon icon="material-symbols:warning" width="48" className="mx-auto text-yellow-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Mobile Experience Notice</h2>
            <p className="text-gray-300 mb-6">
              This website is optimized for desktop/laptop viewing. 
              You may experience poor design functionality on mobile devices.
            </p>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => setShowMobileWarning(false)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
              >
                Open Anyway
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Navigation Bar */}
      <nav className={`flex items-center justify-between px-4 py-3 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/90 backdrop-blur-sm' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="flex items-center space-x-6">
          <Icon icon="logos:spotify" width="40" className="flex-shrink-0" />
          
          <div className="hidden md:flex space-x-6">
            <Link to="#" className="text-white hover:text-green-500 transition-colors font-medium">Premium</Link>
            <Link to="#" className="text-white hover:text-green-500 transition-colors font-medium">Support</Link>
            <Link to="#" className="text-white hover:text-green-500 transition-colors font-medium">Download</Link>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon icon="ei:search" width="20" height="20" className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="What do you want to play?"
              className="w-full bg-white/10 rounded-full py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white/20 transition-all"
              value={searchQuery}
              onChange={() => alert("Please Login to search")}
              onSubmitCapture={() => navigate("/login")  }
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/signup" className="text-white hover:text-green-500 transition-colors text-sm font-medium">Sign up</Link>
            <div className="h-6 w-px bg-gray-600"></div>
          </div>
          <Link to="/login" className="bg-green-400 text-black hover:bg-green-500 hover:scale-105 transition-all rounded-full px-6 py-2 font-bold text-sm">
            Log in
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex pt-16">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden md:block fixed top-16 left-0 bottom-0 w-64 bg-black overflow-y-auto p-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3" onClick={() => navigate('/login')}>
                <Icon icon="bx:library" width="24" className="text-gray-400" />
                <span className="font-bold text-white">Your Library</span>
              </div>
              <button className="text-gray-400 hover:text-white">
                <Icon icon="ic:baseline-plus" width="24" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-900/30 to-gray-800/30 rounded-lg p-4">
                <h3 className="font-bold mb-2">Create your first playlist</h3>
                <p className="text-sm text-gray-400 mb-4">It's easy, we'll help you</p>
                <button onClick={() => navigate('/login')} className="bg-white text-black hover:scale-105 transition-transform rounded-full px-4 py-1.5 text-sm font-bold">
                  Create playlist
                </button>
              </div>

              <div className="bg-gradient-to-r from-blue-900/30 to-gray-800/30 rounded-lg p-4">
                <h3 className="font-bold mb-2">Let's find some podcasts to follow</h3>
                <p className="text-sm text-gray-400 mb-4">We'll keep you updated on new episodes</p>
                <button onClick={() => navigate('/login')} className="bg-white text-black hover:scale-105 transition-transform rounded-full px-4 py-1.5 text-sm font-bold">
                  Browse podcasts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 md:ml-64 p-6">
          {/* Recently Played Section */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Recently played</h2>
              <button className="text-sm font-bold text-gray-400 hover:text-white">Show all</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {albums.slice(0, 6).map((album) => (
                <div onClick={() => alert("Please Login First")} key={album.id} className="group relative bg-gray-800/30 hover:bg-gray-700/50 rounded-lg p-4 transition-all cursor-pointer">
                  <div className="relative mb-4">
                    <img 
                      src={album.image} 
                      alt={album.name} 
                      className="w-full aspect-square object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "";
                      }}
                    />
                    <button className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all hover:scale-105 shadow-lg">
                      <Icon icon="mdi:play" width="20" className="text-black" />
                    </button>
                  </div>
                  <h3 className="font-bold truncate">{album.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{album.artist}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Artists Section */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Popular artists</h2>
              <button className="text-sm font-bold text-gray-400 hover:text-white">Show all</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {artists.map((artist) => (
                <div onClick={() => alert("Please Login First")} key={artist.id} className="group relative bg-gray-800/30 hover:bg-gray-700/50 rounded-lg p-4 transition-all cursor-pointer">
                  <div className="relative mb-4">
                    <div className="rounded-full overflow-hidden aspect-square">
                      <img 
                        src={artist.image} 
                        alt={artist.name} 
                        className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.src = "";
                        }}
                      />
                    </div>
                    <button className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all hover:scale-105 shadow-lg">
                      <Icon icon="mdi:play" width="20" className="text-black" />
                    </button>
                  </div>
                  <h3 className="font-bold truncate">{artist.name}</h3>
                  <p className="text-sm text-gray-400">{artist.type}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Made For You Section */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Made for you</h2>
              <button className="text-sm font-bold text-gray-400 hover:text-white">Show all</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {dailyMixes.map((mix) => (
                <div key={mix.id} className="group relative bg-gradient-to-br from-purple-900/30 to-gray-800/50 rounded-lg p-6 transition-all cursor-pointer hover:from-purple-900/40 hover:to-gray-800/60">
                  <div className="flex flex-col h-full">
                    <h3 className="font-bold text-xl mb-2">{mix.name}</h3>
                    <p className="text-sm text-gray-400 mb-4">{mix.description}</p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {mix.artists.map((artist, idx) => (
                        <div onClick={() => alert("Please Login First")} key={idx} className="w-12 h-12 rounded-full overflow-hidden">
                          <img 
                            src={artist.image} 
                            alt={artist.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = "";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Radio Section */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Popular radio</h2>
              <button className="text-sm font-bold text-gray-400 hover:text-white">Show all</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {radios.map((radio) => (
                <div onClick={() => alert("Please Login First")} key={radio.id} className="group relative bg-gray-800/30 hover:bg-gray-700/50 rounded-lg p-4 transition-all cursor-pointer">
                  <div className="relative mb-4">
                    <img 
                      src={radio.image} 
                      alt={radio.name} 
                      className="w-full aspect-square object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "";
                      }}
                    />
                    <button className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all hover:scale-105 shadow-lg">
                      <Icon icon="mdi:play" width="20" className="text-black" />
                    </button>
                  </div>
                  <h3 className="font-bold truncate">{radio.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{radio.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* India's Best Section */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">India's best</h2>
              <button className="text-sm font-bold text-gray-400 hover:text-white">Show all</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestOfIndia.map((item) => (
                <div onClick={() => alert("Please Login First")} key={item.id} className="group relative bg-gray-800/30 hover:bg-gray-700/50 rounded-lg p-4 transition-all cursor-pointer">
                  <div className="relative mb-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full aspect-square object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "";
                      }}
                    />
                    <button className="absolute bottom-2 right-2 bg-green-500 rounded-full p-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all hover:scale-105 shadow-lg">
                      <Icon icon="mdi:play" width="20" className="text-black" />
                    </button>
                  </div>
                  <h3 className="font-bold truncate">{item.name}</h3>
                  <p className="text-sm text-gray-400 truncate">{item.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 flex justify-around py-3 z-50">
        <button className="flex flex-col items-center text-white">
          <Icon icon="material-symbols:home" width="24" />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <Icon icon="material-symbols:search" width="24" />
          <span className="text-xs mt-1">Search</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <Icon icon="material-symbols:library-music" width="24" />
          <span className="text-xs mt-1">Your Library</span>
        </button>
        <button className="flex flex-col items-center text-gray-400">
          <Icon icon="material-symbols:settings" width="24" />
          <span className="text-xs mt-1">Settings</span>
        </button>
      </div>
    </div>
  );
}

export default Home;