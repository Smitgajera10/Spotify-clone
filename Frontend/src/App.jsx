import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { useCookies } from "react-cookie"
import './App.css'
import Home from './routes/Home.jsx'
import Login from './routes/Login.jsx'
import SignUp from './routes/SignUp.jsx';
import LoggedinHome from "./routes/LoggedinHome.jsx";
import UploadSong from "./routes/UploadSong.jsx";
import MyMusic from "./routes/MyMusic.jsx";
import SearchPage from "./routes/SearchPage.jsx";
import songContext from "./contexts/songContext.js";
import { SearchProvider } from "./contexts/SearchContext.jsx";
import { useState } from "react";
import SinglePlaylistView from "./routes/SinglePlaylistView.jsx";
import TrendingContext from "./contexts/TrendingContext.js";
import TrendingSongs from "./routes/TrendingSongs.jsx";
import PlaylistMobile from "./routes/PlaylistMobile.jsx";

function App() {
  const [cookie, setCookie] = useCookies(["token"]);
  const [currentSong, setCurrentSong] = useState(null);
  const [soundPlayed, setSoundPlayed] = useState(null);
  const [isPaused, setIsPaused] = useState(true);
  const [playlist, setPlaylist] = useState([]);

  const [trendingSongs, setTrendingSongs] = useState([]);
  const [trendingPlaylists, setTrendingPlaylists] = useState([]);
  const [trendingArtists, setTrendingArtists] = useState([]);
  const [trendingRadio , setTrendingRadio] = useState([]);
  const [hasFetched , setHasFetched] = useState(false);

  return (
    <>
      <BrowserRouter>
        <TrendingContext.Provider value={{ trendingSongs, setTrendingSongs, trendingPlaylists, setTrendingPlaylists, trendingArtists, setTrendingArtists, hasFetched , setHasFetched , trendingRadio , setTrendingRadio }}>
          {cookie.token ? (
            // routes for loggdin
            <SearchProvider>
              <songContext.Provider value={{ currentSong, setCurrentSong, soundPlayed, setSoundPlayed, isPaused, setIsPaused, playlist, setPlaylist }}>
                <Routes>
                  <Route path='/' element={<LoggedinHome />} />
                  <Route path='/uploadSong' element={<UploadSong />} />
                  <Route path='/myMusic' element={<MyMusic />} />
                  <Route path='/search' element={<SearchPage />} />
                  <Route path='/library' element={<PlaylistMobile />} />
                  <Route path='/playlist/:playlistId' element={<SinglePlaylistView />} />
                  <Route path='/trending-songs' element={<TrendingSongs/>} />
                  <Route path='*' element={<Navigate to="/" />} />
                </Routes>
              </songContext.Provider>
            </SearchProvider>

          ) : (
            //routes for not login
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/login' element={<Login />} />
              <Route path='/signup' element={<SignUp />} />
              <Route path='*' element={<Navigate to="/login" />} />
            </Routes>
          )}
        </TrendingContext.Provider>
      </BrowserRouter>

    </>
  )
}




export default App
