import '../App.css';
import { Icon } from "@iconify/react";
import TextInput from '../components/TextInput';
import {Link, useNavigate} from "react-router-dom";
import PasswordInput from '../components/PasswordInput';
import { useForm } from 'react-hook-form';
import { useCookies } from 'react-cookie';
import { makeUnauthenticatedPOSTRequest } from '../utils/ServerHelpers';

function Login() {
    const {register , handleSubmit , formState: { errors }} = useForm();
    const [cookies , setCookie] = useCookies(['token']);
    const navigate = useNavigate();

    const onSubmit = async(data) => {
        const responce = await makeUnauthenticatedPOSTRequest("/auth/login" , data);

        if(responce && !responce.error){
            // store the token for 30 days (30 days cookie login)
            const token = responce.token;
            const date = new Date();
            date.setDate(date.getDate() + 30 );
            setCookie('token' , token , {path : "/" , expires : date})
            alert("Success");
            navigate("/")
        }
        else{
            alert("Failure");
        }
    }

    return (
        <div className='w-full min-h-screen flex items-center justify-center p-4'>
            <div className='flex flex-col items-center w-full max-w-md bg-black rounded-lg p-6'>
                <div className="logo mt-4 mb-2">
                    <Icon icon="mdi:spotify" width="40" className='m-0 p-0' />
                </div>
                <div className='text-2xl md:text-3xl font-bold mb-4 text-center'>
                    Login to Spotify
                </div>
                <div className='h-px w-full max-w-xs bg-gray-500 opacity-40 my-2'></div>
                <div className="w-full max-w-xs">
                    <TextInput 
                        label="Email or username"
                        placeholder="Email or username"
                        className="my-4" 
                        register={register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: "Invalid email address",
                            },
                        })}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}

                    <PasswordInput
                        label="Password"
                        placeholder="Password"
                        register={register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters long"
                            }
                        })}
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}

                    <div className="flex justify-center w-full mt-6">
                        <button 
                            onClick={handleSubmit(onSubmit)}
                            className='w-full bg-green-500 hover:bg-green-600 transition-colors font-semibold p-2.5 text-black rounded-full'
                        >
                            LOG IN
                        </button>
                    </div>

                    <div className="mt-8 mb-4 flex flex-col sm:flex-row items-center justify-center w-full text-center">
                        <div className="opacity-60 mb-2 sm:mb-0 sm:pr-2">Don't have an account?</div>
                        <div className='underline hover:text-green-500 transition-colors'>
                            <Link to="/signup">Sign up for Spotify</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;