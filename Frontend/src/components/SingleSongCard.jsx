import { useContext, useState, useRef, useEffect, useMemo } from "react";
import songContext from "../contexts/songContext.js";


const SingleSongCard = ({ info, playSound }) => {
  const { currentSong, setCurrentSong } = useContext(songContext);

  const [duration, setDuration] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (info.track) {
      const audio = new window.Audio(info.track);
      audioRef.current = audio;
      const onLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      audio.addEventListener("loadedmetadata", onLoadedMetadata);
      // Preload metadata
      audio.load();

      return () => {
        audio.removeEventListener("loadedmetadata", onLoadedMetadata);
        audioRef.current = null;
      };
    }
  }, [info.track]);

  // Format duration as mm:ss
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "--:--";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  function decodeHtmlEntities(str) {
    const parser = new DOMParser();
    const decoded = parser.parseFromString(str, "text/html").body.textContent;
    return decoded;
  }

  const decodedName = useMemo(() => decodeHtmlEntities(info?.name), [info?.name]);


  return (
    <div className={`flex hover:bg-gray-800 p-2 rounded-sm ${currentSong?._id === info._id ? 'bg-gray-700' : ''}`} onClick={() => setCurrentSong(info)}>
      <div className="w-12 h-12 bg-cover bg-center"
        style={{
          backgroundImage: `url("${info?.thumbnail}")`
        }}></div>

      <div className="flex w-full">
        <div className="text-white flex justify-center flex-col pl-4 w-5/6">
          <div className="cursor-pointer hover:underline">{decodedName}</div>
          <div className="text-xs text-gray-400 cursor-pointer hover:underline"> {info?.artistName} </div>
        </div>

        <div className="w-1/6 flex items-center justify-center text-gray-400 text-sm">
          <div>{info?.duration || formatDuration(duration)} </div>
        </div>
      </div>

    </div>
  )
}

export default SingleSongCard