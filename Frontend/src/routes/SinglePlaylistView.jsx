import { useEffect, useState, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import LoggedInContainer from "../containers/LoggedInContainer";
import {
    makeAuthenticatedGETRequest,
    makeAuthenticatedPOSTRequest,
    makeAuthenticatedDELETERequest,
} from "../utils/serverHelpers";
import songContext from '../contexts/songContext.js';
import SingleSongCard from "../components/SingleSongCard";

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
    const { setPlaylist } = useContext(songContext);

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
        data.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        data.append("cloud_name", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

        try {
            setUploading(true);
            const response = await fetch(
                import.meta.env.VITE_CLOUDINARY_API_URL,
                {
                    method: "POST",
                    body: data,
                }
            );
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
            if (response) {
                alert("Playlist deleted.");
                // Optional: redirect to your library/home page
                window.location.href = "/";
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


    return (
        <LoggedInContainer curActiveScreen={"library"}>
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

                        <div className="absolute bottom-6 left-6 flex items-end gap-6">
                            <div className="relative w-48 h-48 shadow-2xl group">
                                {thumbnailPreview ? (
                                    <img
                                        src={thumbnailPreview}
                                        alt="Playlist cover"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                        <span className="text-4xl text-gray-400">🎵</span>
                                    </div>
                                )}

                                {!isEditingThumbnail && (
                                    <button
                                        onClick={() => setIsEditingThumbnail(true)}
                                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="text-white text-sm font-medium">Change Image</span>
                                    </button>
                                )}
                            </div>

                            <div className="text-white">
                                <p className="text-sm font-medium">Playlist</p>
                                <h1 className="text-5xl font-bold mt-2 mb-4">
                                    {editing ? (
                                        <input
                                            type="text"
                                            value={playlistName}
                                            onChange={(e) => setPlaylistName(e.target.value)}
                                            className="bg-transparent border-b border-white text-white text-5xl font-bold"
                                        />
                                    ) : (
                                        playlistDetails.name
                                    )}
                                </h1>
                                <p className="text-gray-300">
                                    {playlistDetails.songs?.length || 0} songs
                                </p>
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

                    <div className="px-6 pt-4 flex gap-4">
                        {editing && playlistName !== playlistDetails.name ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={updatePlaylistName}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-full text-sm"
                                >
                                    Save Name
                                </button>
                                <button
                                    onClick={() => {
                                        setEditing(false);
                                        setPlaylistName(playlistDetails.name);
                                    }}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded-full text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                className="text-gray-400 hover:text-white text-sm border border-gray-400 hover:border-white px-4 py-1 rounded-full"
                            >
                                Edit Playlist Name
                            </button>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={sharePlaylist}
                                className="text-blue-400 hover:text-white border border-blue-400 hover:border-white px-4 py-1 rounded-full text-sm"
                            >
                                Share Playlist
                            </button>
                            <button
                                onClick={deletePlaylist}
                                className="text-red-400 hover:text-white border border-red-400 hover:border-white px-4 py-1 rounded-full text-sm"
                            >
                                Delete Playlist
                            </button>
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
