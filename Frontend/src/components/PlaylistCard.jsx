import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import { useNavigate } from "react-router";


const PlaylistCard = ({ title, description, imgUrl, playlistId , owner}) => {
    const navigate = useNavigate();
    return (
        <div
            className="bg-black/70 w-full p-1 rounded-lg cursor-pointer hover:bg-gray-900 flex "
            onClick={() => {
                navigate("/playlist/" + playlistId);
            }}
        >
            {imgUrl ?
                <div className="h-12 w-12">
                    <img className="w-full h-full rounded-md" src={imgUrl} alt="label"/>
                </div>
                : <div className="h-12 w-12 bg-black/30 rounded-xl">
                    <Icon icon="mdi:playlist-music" className="w-full p-2 h-full" />
                </div>
            }
            <div className="flex flex-col justify-between px-4 w-full">
                <div className="text-white font-semibold">{title}</div>
                <div className="flex space-x-0.5 items-center">
                    <div className="text-white/50 text-sm">Playlist</div>
                    <Icon icon="ph:dot-outline" className="text-white/50" />
                    <div className="text-white/50 text-sm">{description ? description : owner.firstName + " " + owner.lastName}</div>
                </div>
            </div>

        </div>
    );
};

export default React.memo(PlaylistCard);
