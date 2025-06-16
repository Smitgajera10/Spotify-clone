import { useState } from "react";
import LoggedInContainer from "../containers/LoggedInContainer"
import { useEffect } from "react";
import { useContext } from "react";
import songContext from "../contexts/songContext";
import { makeAuthenticatedGETRequest } from "../utils/ServerHelpers";
import SkeletonCard from "../components/SkeletonCard";

const TrendingSongs = () => {
    const [trendingSongs, setTrendingSongs] = useState([]);
    const { setCurrentSong } = useContext(songContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTrendingSong();
    }, [])

    const getTrendingSong = async () => {
        try {
            setLoading(true);
            const res = await makeAuthenticatedGETRequest(`/api/trending-songs?limit=30`);

            if (Array.isArray(res.trendingSongs)) {
                setTrendingSongs(res.trendingSongs);
            } else {
                console.warn('Unexpected format:', res);
                setTrendingSongs([]);
            }
        } catch (error) {
            console.error('Error fetching trending songs:', res);
            setTrendingSongs([]);
        } finally{
            setLoading(false);
        }
    };
    return (
        <LoggedInContainer>
            <div className="flex justify-between items-center mx-4 my-4 sm:mx-5">
                <h2 className="text-xl sm:text-2xl font-bold">Popular Songs</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:px-5 pb-4">

                {loading
                    ? [...Array(28)].map((_, idx) => <SkeletonCard key={idx} />)
                    : trendingSongs.map((song) => (
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
    )
}
export default TrendingSongs;