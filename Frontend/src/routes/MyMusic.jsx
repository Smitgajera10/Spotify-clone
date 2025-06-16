import './Home.css';
import { useEffect, useState } from 'react';
import SingleSongCard from '../components/SingleSongCard';
import { makeAuthenticatedGETRequest } from '../utils/serverHelpers';
import LoggedInContainer from '../containers/LoggedInContainer';

function MyMusic() {
    const [songData, setSongData] = useState([]);

    useEffect(() => {
        const getData = async () => {
            const responce = await makeAuthenticatedGETRequest("/song/get/mysongs");
            setSongData(responce.data)
        }
        getData();
    }, [])

    return (
        <LoggedInContainer curActiveScreen={"myMusic"}>
            <div className='p-8'>
                <div className='text-white text-xl font-semibold pb-4 pl-2'>Songs</div>
                <div className='space-y-3 overflow-auto'>
                    {songData.map((item) => {
                        return <SingleSongCard info={item}
                         key={JSON.stringify(item)}
                        playSound={() => {}} />
                    })}
                </div>
            </div>
        </LoggedInContainer>
    )
}


export default MyMusic;
