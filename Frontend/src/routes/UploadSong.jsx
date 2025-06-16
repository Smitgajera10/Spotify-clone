import './Home.css';
import { Link, useNavigate } from "react-router-dom";
import { Icon } from '@iconify/react';
import TextInput from '../components/TextInput';
import CloudinaryUpload from '../components/CloudinaryUpload';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { makeAuthenticatedPOSTRequest } from '../utils/ServerHelpers';
import LoggedInContainer from '../containers/LoggedInContainer';


function UploadSong() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [uploadedUrl, setUploadedUrl] = useState("");
    const [songName, setSongName] = useState("");
    const navigate = useNavigate();

    const submitSong = async(data) =>{
        data = {...data , track : uploadedUrl};
        console.log(data);

        const responce = await makeAuthenticatedPOSTRequest("/song/create" , data);

        if(responce.error){
            alert("Could not create song")
            return
        }
        alert("Success");
        navigate("/")
    }

    return (
        <LoggedInContainer curActiveScreen={"uploadSong"}>
            <div className="m-5">
                            <div className="font-bold text-2xl">Upload Songs</div>
                        </div>

                        <div className='m-5 w-2/3 flex space-x-3'>
                            <div className='w-1/2'>
                                <TextInput label="Name"
                                    type="text"
                                    placeholder="Name"
                                    register={register("name", {
                                        required: "required",
                                        minLength: {
                                            value: 3,
                                            message: "Name must be at least 3 characters long",
                                        },
                                    })}
                                />
                            </div>
                            <div className='w-1/2'>
                                <TextInput label="Thumbnail"
                                    type="text"
                                    placeholder="Thumbnail"
                                    register={register("thumbnail", {
                                        required: "required",
                                    })}
                                />
                            </div>
                        </div>

                        <div className='ml-5'>
                            {
                                songName ? <div className='bg-white flex text-black rounded-full p-3 w-fit items-center'>
                                    {songName.substring(0, 30)}...
                                </div>
                                    :
                                    <CloudinaryUpload setUrl={setUploadedUrl} setName={setSongName} />
                            }
                        </div>

                        <div
                            className="bg-white m-7 w-40 flex items-center justify-center p-4 rounded-full cursor-pointer font-semibold text-black"
                            onClick={handleSubmit(submitSong)}
                        >
                            Submit Song
                        </div>
            </LoggedInContainer>
    )
}

export default UploadSong;
