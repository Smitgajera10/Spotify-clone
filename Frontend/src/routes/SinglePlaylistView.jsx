import { useEffect, useState, useRef, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoggedInContainer from "../containers/LoggedInContainer";
import {
    makeAuthenticatedGETRequest,
    makeAuthenticatedPOSTRequest,
    makeAuthenticatedDELETERequest,
} from "../utils/ServerHelpers";
import songContext from '../contexts/songContext.js';
import SingleSongCard from "../components/SingleSongCard";
import SpotifyImportModal from "../models/SpotifyImportModal.jsx";
import { Icon } from "@iconify/react/dist/iconify.js";

const SinglePlaylistView = () => {
    const [playlistDetails, setPlaylistDetails] = useState({});
    const [editing, setEditing] = useState(false);
    const [playlistName, setPlaylistName] = useState("");
    const [isEditingThumbnail, setIsEditingThumbnail] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState("");
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { playlistId } = useParams();
    const {setCurrentSong, setPlaylist } = useContext(songContext);
    const [showImportModal, setShowImportModal] = useState(false);
    const navigate = useNavigate()


    const getData = async () => {
        const response = await makeAuthenticatedGETRequest("/playlist/get/" + playlistId);
        setPlaylistDetails(response);
        setPlaylistName(response.name);
        setThumbnailPreview(response.thumbnail || "");
        setEditing(false);
        setIsEditingThumbnail(false);
    };

    useEffect(() => {
        getData();
    }, [playlistId]);

    useEffect(() => {
        if (playlistDetails?.songs?.length > 0) {
            setPlaylist(playlistDetails.songs);
        }
    }, [playlistDetails?.songs]);

    const deleteSongFromPlaylist = async (songId) => {
        try {
            const response = await makeAuthenticatedDELETERequest(
                `/playlist/delete/song/${playlistId}/${songId}`
            );
            if (response._id) {
                setPlaylistDetails({
                    ...playlistDetails,
                    songs: playlistDetails.songs.filter((song) => song._id !== songId),
                });
            }
        } catch (error) {
            console.error("Error deleting song from playlist:", error);
        }
    };

    const updatePlaylistName = async () => {
        try {
            setEditing(false); // Immediately hide input/buttons
            const response = await makeAuthenticatedPOSTRequest(
                `/playlist/update/${playlistId}`,
                { name: playlistName }
            );
            if (response._id) {
                setPlaylistDetails((prev) => ({
                    ...prev,
                    name: playlistName,
                }));
            }
            getData()
        } catch (error) {
            console.error("Error updating playlist name:", error);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const uploadToCloudinary = async () => {
        if (!thumbnailFile) return null;

        const data = new FormData();
        data.append("file", thumbnailFile);
        data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_PRESET);
        data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_FOLDER);

        try {
            setUploading(true);
            const response = await fetch(
                import.meta.env.VITE_CLOUDINARY_URL,
                {
                    method: "POST",
                    body: data,
                }
            );
            console.log(response)
            const result = await response.json();
            return result.secure_url;
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const updatePlaylistThumbnail = async () => {
        const thumbnailUrl = await uploadToCloudinary();
        if (!thumbnailUrl) return;

        try {
            const response = await makeAuthenticatedPOSTRequest(
                `/playlist/update/${playlistId}`,
                { thumbnail: thumbnailUrl }
            );

            if (response) {
                setPlaylistDetails((prev) => ({
                    ...prev,
                    thumbnail: thumbnailUrl,
                }));
                setThumbnailPreview(thumbnailUrl);
                setThumbnailFile(null);
                setIsEditingThumbnail(false);
                getData(); // Refresh playlist details
            }
        } catch (error) {
            console.error("Error updating playlist thumbnail:", error);
        }
    };

    const deletePlaylist = async () => {
        const confirmed = window.confirm("Are you sure you want to delete this playlist?");
        if (!confirmed) return;

        try {
            const response = await makeAuthenticatedDELETERequest(`/playlist/delete/${playlistId}`);
            if (!response.error) {
                alert("Playlist deleted.");
                navigate("/");
            }
            else{
                throw Error("Not Allowed")
            }
        } catch (error) {
            console.error("Error deleting playlist:", error);
            alert("Failed to delete playlist.", error.message || "");
        }
    };

    const sharePlaylist = () => {
        const url = `${window.location.origin}/playlist/${playlistId}`;
        navigator.clipboard.writeText(url)
            .then(() => alert("Playlist link copied to clipboard!"))
            .catch(() => alert("Failed to copy link."));
    };

    const handleImportSpotifyPlaylist= async(playlistLink)=>{
        console.log("Importing:", playlistLink);
        try{
            const payload = {playlistId , playlistUrl : playlistLink}
            const response = await makeAuthenticatedPOSTRequest(`/api/playlist/add/songs`, payload);
            if(response.message){
                window.alert(response.message);
                console.log(response.playlist)
                setPlaylistDetails(response.playlist);
                setShowImportModal(false);

            }
            else{
                throw new Error("Not Allowed")
            }
        }catch(err){
            console.log(err);
            alert(err.message)
        }finally{
        }
    }

    const handlePlayPlaylist = () => {
        if (!playlistDetails.songs || playlistDetails.songs.length === 0) return;

        const randomIndex = Math.floor(Math.random() * playlistDetails.songs.length);
        const randomSong = playlistDetails.songs[randomIndex];

        setPlaylist(playlistDetails.songs); // for autoplay context
        setCurrentSong(randomSong);         // start playing random song
    };

    return (
        <LoggedInContainer curActiveScreen={"library"}>
            <SpotifyImportModal
                show={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImport={handleImportSpotifyPlaylist}
            />
            {playlistDetails._id && (
                <div className="relative">
                    <div
                        className="relative h-64 w-full bg-gradient-to-b from-gray-800 to-gray-900"
                        style={{
                            backgroundImage: thumbnailPreview
                                ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${thumbnailPreview})`
                                : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>

                        <div className="absolute bottom-2 left-4 sm:bottom-6 sm:left-6 flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 w-[calc(100%-2rem)] sm:w-auto">
                            <div className="relative w-32 h-32 sm:w-48 sm:h-48 shadow-2xl group">
                                {thumbnailPreview ? (
                                    <img
                                        src={thumbnailPreview}
                                        alt="Playlist cover"
                                        className="w-full h-full object-cover rounded"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded">
                                        <span className="text-3xl sm:text-4xl text-gray-400">🎵</span>
                                    </div>
                                )}
                                {!isEditingThumbnail && (
                                    <button
                                        onClick={() => setIsEditingThumbnail(true)}
                                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded"
                                    >
                                        <span className="text-white text-xs sm:text-sm font-medium">Change Image</span>
                                    </button>
                                )}
                            </div>

                            <div className="text-white mt-2 sm:mt-0">
                                <p className="text-xs sm:text-sm font-medium">Playlist</p>
                                <h1 className="text-2xl sm:text-5xl font-bold mt-1 sm:mt-2 mb-2 sm:mb-4">
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={playlistName}
                                            onChange={(e) => setPlaylistName(e.target.value)}
                                            className="bg-transparent border-b border-white text-white text-2xl sm:text-5xl font-bold w-full"
                                        />
                                    ) : (
                                        playlistDetails.name
                                    )}
                                </h1>
                                <div className="flex items-center gap-4 mt-4">
                                    <p className="text-gray-300 text-sm sm:text-base">
                                        {playlistDetails.songs?.length || 0} songs
                                    </p>

                                    <button
                                        onClick={handlePlayPlaylist}
                                        className="bg-green-500 hover:bg-green-600 rounded-full p-2 sm:p-2 shadow-md transition-transform duration-200 hover:scale-110 focus:outline-none"
                                        aria-label="Play Playlist"
                                    >
                                        <Icon
                                            icon="ic:baseline-play-arrow"
                                            width="28"
                                            height="28"
                                            style={{ color: "white" }}
                                        />
                                    </button>
                                </div>

                                
                            </div>
                        </div>

                    </div>

                    {isEditingThumbnail && (
                        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                            <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
                                <h2 className="text-white text-xl mb-4">Change Playlist Thumbnail</h2>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleThumbnailChange}
                                    accept="image/*"
                                    className="hidden"
                                />

                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full w-full mb-4"
                                    disabled={uploading}
                                >
                                    {thumbnailFile ? "Change Image" : "Select Image"}
                                </button>

                                {thumbnailPreview && (
                                    <div className="mb-4 flex justify-center">
                                        <img
                                            src={thumbnailPreview}
                                            alt="Preview"
                                            className="max-h-48 rounded"
                                        />
                                    </div>
                                )}

                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={() => {
                                            setIsEditingThumbnail(false);
                                            setThumbnailPreview(playlistDetails.thumbnail || "");
                                            setThumbnailFile(null);
                                        }}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-full"
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={updatePlaylistThumbnail}
                                        disabled={!thumbnailFile || uploading}
                                        className={`px-4 py-2 rounded-full ${(!thumbnailFile || uploading)
                                            ? 'bg-gray-500 text-gray-300'
                                            : 'bg-green-500 hover:bg-green-600 text-white'
                                            }`}
                                    >
                                        {uploading ? "Uploading..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="px-4 md:px-6 pt-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                        {/* Edit Playlist Name Section */}
                        <div className="flex-shrink-0">
                            {editing && playlistName !== playlistDetails.name ? (
                                <div className="flex gap-2">
                                    <button
                                        onClick={updatePlaylistName}
                                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 md:px-4 rounded-full text-xs md:text-sm"
                                    >
                                        Save Name
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            setPlaylistName(playlistDetails.name);
                                        }}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 md:px-4 rounded-full text-xs md:text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="text-gray-400 hover:text-white text-xs md:text-sm border border-gray-400 hover:border-white px-3 py-1 md:px-4 rounded-full"
                                >
                                    Edit Playlist Name
                                </button>
                            )}
                        </div>

                        {/* Action Buttons Section */}
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <button
                                onClick={sharePlaylist}
                                className="text-blue-400 hover:text-white border border-blue-400 hover:border-white px-3 py-1 md:px-4 rounded-full text-xs md:text-sm"
                            >
                                Share Playlist
                            </button>
                            <button
                                onClick={deletePlaylist}
                                className="text-red-400 hover:text-white border border-red-400 hover:border-white px-3 py-1 md:px-4 rounded-full text-xs md:text-sm"
                            >
                                Delete Playlist
                            </button>

                            <div className="max-w-full">
                                <div className="relative group cursor-pointer"
                                onClick={()=>setShowImportModal(true)}>
                                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-green-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                                    <div className="relative px-3 py-1 md:px-4 md:py-2 bg-blue-400 ring-1 ring-gray-900/5 rounded-full leading-none flex items-center">
                                        <p className="text-slate-800 text-xs md:text-sm whitespace-nowrap">
                                            Add your spotify playlist Songs
                                        </p>
                                        <span className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shadow-sm transform rotate-6 hover:rotate-0 transition-transform">
                                            New
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 pt-6 pb-20 space-y-3">
                        {playlistDetails.songs?.map((item) => (
                            <div key={item._id} className="flex items-center group">
                                <div className="w-full">
                                    <SingleSongCard info={item} playSound={() => { }} />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm("Remove this song from playlist?")) {
                                            deleteSongFromPlaylist(item._id);
                                        }
                                    }}
                                    className="mr-4 text-gray-400 group-hover:text-red-500 hover:text-red-700 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </LoggedInContainer>
    );
};

export default SinglePlaylistView;
