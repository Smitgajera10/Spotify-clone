import './Home.css';
import LoggedInContainer from '../containers/LoggedInContainer';
import { useContext, useEffect, useState } from 'react';
import songContext from '../contexts/songContext';
import TrendingContext from '../contexts/TrendingContext';
import { makeAuthenticatedGETRequest } from '../utils/ServerHelpers';
import SkeletonCard from '../components/SkeletonCard';
import { useNavigate } from 'react-router';
function LoggedinHome() {
  const { currentSong, setCurrentSong } = useContext(songContext);
  const {
    trendingSongs,
    setTrendingSongs,
    trendingPlaylists,
    setTrendingPlaylists,
    trendingArtists,
    setTrendingArtists,
    trendingRadio,
    setTrendingRadio,
    hasFetched,
    setHasFetched
  } = useContext(TrendingContext);
  const navigate = useNavigate()


  const getTrendingPlaylist = async () => {
  try {
    
    const ids = ["687b73bdee10a8f3d1286703"];
    const playlists = [];
    for (let i = 0; i < ids.length; i++) {
      const data = await makeAuthenticatedGETRequest(`/playlist/get/${ids[i]}`);
      if (data) playlists.push(data);
    }
    // Now playlists is an array of playlist objects
    setTrendingPlaylists(playlists);
  } catch (error) {
    console.error('Error fetching trending playlists:', error);
    setTrendingPlaylists([]);
  } 
};

  const getTrendingSong = async () => {
    try {
      
      const res = await makeAuthenticatedGETRequest(`/api/tsongs`);
      if (Array.isArray(res.trendingSongs)) {
        setTrendingSongs(res.trendingSongs);
      } else {
        console.warn('Unexpected format:', res);
        setTrendingSongs([]);
      }
    } catch (error) {
      console.error('Error fetching trending songs:', res);
      setTrendingSongs([]);
    } 
  };

  const getTrendingArtist = async () => {
    try {
      const res = await makeAuthenticatedGETRequest(`/api/popular-artists`);
      if (Array.isArray(res.popularArtists)) {
        setTrendingArtists(res.popularArtists);
      } else {
        console.warn('Unexpected format:', res);
        setTrendingArtists([]);
      }
    } catch (error) {
      console.error('Error fetching trending songs:', error);
      setTrendingArtists([]);
    } 
  }
  const getTrendingRadio = async () => {
    try {
      
      const res = await makeAuthenticatedGETRequest(`/api/popular-radio`);
      if (Array.isArray(res.radio)) {
        setTrendingRadio(res.radio);
      } else {
        console.warn('Unexpected format:', res);
        setTrendingRadio([]);
      }
    } catch (error) {
      console.error('Error fetching trending songs:', error);
      setTrendingRadio([]);
    }
  }

  useEffect(() => {
    const loadData = async()=>{
      if(hasFetched) return;
      try {
        await Promise.all([getTrendingSong(),
        getTrendingPlaylist(),
        getTrendingArtist(),
        getTrendingRadio()])
      
        setHasFetched(true)
      }catch (err) {
        console.error("Trending data load failed:", err.message);
      }
    }
    loadData()
  }, []);
  return (
    <LoggedInContainer>
      {/* Popular Artists */}

      <div className="flex justify-between items-center mx-4 my-4 sm:mx-5">
        <h2 className="text-xl sm:text-2xl font-bold">Popular Songs</h2>
        <span className="text-xs sm:text-sm font-bold opacity-70 hover:underline hover:text-white hover:cursor-pointer" onClick={() => {
          navigate("/trending-songs");
        }}>Show all</span>
      </div>

      <div className="flex overflow-x-auto gap-4 px-4 sm:px-5 pb-4 hide-scrollbar">


        {!hasFetched
          ? [...Array(6)].map((_, idx) => <SkeletonCard key={idx} />)
          : trendingSongs.slice(0, 6).map((song) => (
            <div className="w-[160px] sm:min-w-[200px] flex-shrink-0 group relative rounded-2xl p-2 hover:bg-[#181818]" key={song._id} onClick={() => { setCurrentSong(song) }}>
              <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] m-auto rounded-2xl overflow-hidden">
                <img src={song.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 group-hover:translate-y-[-10px] transition-transform duration-300 ease-out w-[48px] h-[48px] bg-green-500 rounded-full absolute right-4 top-[95px] sm:top-[115px]">
                <img src="assets/play.svg" alt="" className="w-[25px] m-[12px]" />
              </div>
              <div className="font-bold text-sm sm:text-base pt-2 px-2 truncate">
                {song.name}
              </div>
              <div className="opacity-70 text-sm px-2 ">{song.artistName}</div>
            </div>
          ))}
      </div>

      <div className="flex justify-between items-center mx-4 my-4 sm:mx-5">
        <h2 className="text-xl sm:text-2xl font-bold">Popular artists</h2>
        <span className="text-xs sm:text-sm font-bold opacity-70">Show all</span>
      </div>

      <div className="flex overflow-x-auto gap-4 px-4 sm:px-5 pb-4 hide-scrollbar">
        {!hasFetched
          ? [...Array(6)].map((_, idx) => <SkeletonCard key={idx} shape="circle" />)
          : trendingArtists.slice(0, 6).map((artist) => (
            <div
              className="min-w-[160px] sm:min-w-[200px] flex-shrink-0 group relative rounded-2xl p-2 hover:bg-[#181818]"
              key={artist.id}
            >
              <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] m-auto rounded-full overflow-hidden">
                <img src={artist.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 group-hover:translate-y-[-10px] transition-transform duration-300 ease-out w-[48px] h-[48px] bg-green-500 rounded-full absolute right-4 top-[95px] sm:top-[115px]">
                <img src="assets/play.svg" alt="" className="w-[25px] m-[12px]" />
              </div>
              <div className="font-bold pt-2 truncate text-sm sm:text-base pl-2">{artist.name}</div>
              <div className="opacity-70 text-sm pl-2">Artist</div>
            </div>
          ))}

      </div>

      {/* Popular Albums */}
      <div className="flex justify-between items-center mx-4 my-4 sm:mx-5">
        <h2 className="text-xl sm:text-2xl font-bold">Custom albums and singles</h2>
        <span className="text-xs sm:text-sm font-bold opacity-70">Show all</span>
      </div>

      <div className="flex overflow-x-auto gap-4 px-4 sm:px-5 pb-4 hide-scrollbar">

        {!hasFetched
          ? [...Array(5)].map((_, idx) => <SkeletonCard key={idx} />)
          : trendingPlaylists.slice(0, 5).map((playlist) => (
            <div className="w-[160px] sm:min-w-[200px] flex-shrink-0 group relative rounded-2xl p-2 hover:bg-[#181818]" key={playlist._id} onClick={() => {navigate(`/playlist/${playlist._id}`) }}>
              <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] m-auto rounded-2xl overflow-hidden">
                <img src={playlist.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 group-hover:translate-y-[-10px] transition-transform duration-300 ease-out w-[48px] h-[48px] bg-green-500 rounded-full absolute right-4 top-[95px] sm:top-[115px]">
                <img src="assets/play.svg" alt="" className="w-[25px] m-[12px]" />
              </div>
              <div className="font-bold text-sm sm:text-base pt-2 px-2 truncate">
                {playlist.name}
              </div>
              <div className="opacity-70 text-sm px-2">{playlist.description}</div>
            </div>
          ))}
      </div>

      {/* Popular Radio */}
      <div className="flex justify-between items-center mx-4 my-4 sm:mx-5">
        <h2 className="text-xl sm:text-2xl font-bold">Popular radio</h2>
        <span className="text-xs sm:text-sm font-bold opacity-70">Show all</span>
      </div>

      <div className="flex overflow-x-auto gap-4 px-4 sm:px-5 pb-4 hide-scrollbar">
        <div className="min-w-[160px] sm:min-w-[200px] flex-shrink-0 group relative rounded-2xl p-2 hover:bg-[#181818]">
          <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] m-auto rounded-2xl overflow-hidden">
            <img src="assets/radio_arijit.jpeg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="opacity-0 group-hover:opacity-100 group-hover:translate-y-[-10px] transition-transform duration-300 ease-out w-[48px] h-[48px] bg-green-500 rounded-full absolute right-4 top-[95px] sm:top-[115px]">
            <img src="assets/play.svg" alt="" className="w-[25px] m-[12px]" />
          </div>
          <div className="opacity-70 text-sm px-2 mt-2 line-clamp-2 max-w-[150px] sm:max-w-[180px]">
            With Sachin-Jigar, Vishal-Shekhar, Amit Trivedi and more
          </div>
        </div>

        {!hasFetched
          ? [...Array(4)].map((_, idx) => <SkeletonCard key={idx} />)
          : trendingRadio.map((Radio) => (
            <div className="w-[160px] sm:min-w-[200px] flex-shrink-0 group relative rounded-2xl p-2 hover:bg-[#181818]" key={Radio.id} onClick={() => { }}>
              <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] m-auto rounded-2xl overflow-hidden">
                <img src={Radio.image[2].url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 group-hover:translate-y-[-10px] transition-transform duration-300 ease-out w-[48px] h-[48px] bg-green-500 rounded-full absolute right-4 top-[95px] sm:top-[115px]">
                <img src="assets/play.svg" alt="" className="w-[25px] m-[12px]" />
              </div>
              <div className="font-bold text-sm sm:text-base pt-2 px-2 truncate">
                {Radio.name}
              </div>
              <div className="opacity-70 text-sm px-2">{Radio.language}</div>
            </div>
          ))}
      </div>

      {/* India's Best */}
      <div className="flex justify-between items-center mx-4 my-4 sm:mx-5">
        <h2 className="text-xl sm:text-2xl font-bold">India's best</h2>
        <span className="text-xs sm:text-sm font-bold opacity-70">Show all</span>
      </div>



      <div className="flex overflow-x-auto gap-4 px-4 sm:px-5 pb-6 hide-scrollbar">
        {!hasFetched  
          ? [...Array(6)].map((_, idx) => <SkeletonCard key={idx} />)
          : trendingSongs.slice(6, 12).map((song) => (
            <div className="w-[160px] sm:min-w-[200px] flex-shrink-0 group relative rounded-2xl p-2 hover:bg-[#181818]" key={song._id} onClick={() => { setCurrentSong(song) }}>
              <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] m-auto rounded-2xl overflow-hidden">
                <img src={song.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 group-hover:translate-y-[-10px] transition-transform duration-300 ease-out w-[48px] h-[48px] bg-green-500 rounded-full absolute right-4 top-[95px] sm:top-[115px]">
                <img src="assets/play.svg" alt="" className="w-[25px] m-[12px]" />
              </div>
              <div className="font-bold text-sm sm:text-base pt-2 px-2 truncate">
                {song.name}
              </div>
              <div className="opacity-70 text-sm px-2 ">{song.artistName}</div>
            </div>
          ))}
      </div>
    </LoggedInContainer>
  );
}

export default LoggedinHome;
