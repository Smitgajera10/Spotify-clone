import { useRef, useEffect, useState, useContext } from "react";
import LoggedInContainer from "../containers/LoggedInContainer";
import { makeAuthenticatedGETRequest } from "../utils/ServerHelpers.js";
import SingleSongCard from "../components/SingleSongCard";
import { SearchContext } from "../contexts/SearchContext.jsx";

const SearchPage = () => {
    const searchInputRef = useRef(null);
    const { searchValue } = useContext(SearchContext);
    const [debouncedValue, setDebouncedValue] = useState("");
    const [songData, setSongData] = useState([]);

    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(searchValue);
        }, 1000);

        return () => {
            clearTimeout(handler);
        };
    }, [searchValue]);

    //call api when debouncedValue changes
    useEffect(() => {
        if (debouncedValue.trim() !== "") {
            searchSong();
        }
    }, [debouncedValue]);


    const searchSong = async () => {
        if (!debouncedValue.trim()) return;

        try {
            const apiSongs = await makeAuthenticatedGETRequest(`/api/search?query=${searchValue}`);
            setSongData(apiSongs);
            console.log("Search results (combined):", apiSongs);
        } catch (err) {
            console.error("Search failed:", err);
        }
    };

    return (
        <LoggedInContainer curActiveScreen={"search"} searchInputRef={searchInputRef} >

            <div>
                {songData.length > 0 ? (
                    <div className="pt-5 pl-4 space-y-2">
                        <div className="text-white text-xl font-semibold pb-4 pl-2">
                            Search Results for: <span className="text-blue-400">{debouncedValue}</span>
                        </div>
                        {songData.map((item) => (
                            <SingleSongCard info={item}
                                key={JSON.stringify(item)}
                                playSound={() => { }} />
                        ))}
                    </div>
                ) : (
                    <p className="no-results">No songs found</p>
                )}
            </div>
        </LoggedInContainer>
    );
};

export default SearchPage;