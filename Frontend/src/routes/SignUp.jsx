import '../App.css';
import { Icon } from "@iconify/react";
import TextInput from '../components/TextInput';
import { Link, useNavigate } from "react-router-dom";
import PasswordInput from '../components/PasswordInput';
import { useForm } from "react-hook-form";
import { useCookies } from "react-cookie";
import { makeUnauthenticatedPOSTRequest } from "../utils/ServerHelpers";

function SignUp() {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const [cookies, setCookie] = useCookies(['token']);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const response = await makeUnauthenticatedPOSTRequest("/auth/register", data);
        if (response && !response.error) {
            const token = response.token;
            const date = new Date();
            date.setDate(date.getDate() + 30);
            setCookie('token', token, { path: "/", expires: date });
            alert("Success");
            navigate("/");
        } else {
            alert("Failure");
        }
    }

    return (
        <div className='w-full min-h-screen flex items-center justify-center p-4'>
            <div className='flex flex-col items-center w-full max-w-[500px] bg-black rounded-lg p-6'>
                <div className="logo mb-4">
                    <Icon icon="mdi:spotify" width="40" className='text-green-500' />
                </div>

                <div className='text-2xl md:text-3xl font-bold text-center mb-4'>
                    Sign up to start listening
                </div>

                <div className='h-[1px] w-full bg-gray-500 opacity-40 my-4'></div>

                <div className="flex flex-col gap-4 w-full">
                    <TextInput
                        label="Email"
                        type="email"
                        placeholder="Email"
                        register={register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                message: "Invalid email address",
                            },
                        })}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

                    <TextInput
                        label="Username"
                        type="text"
                        placeholder="Username"
                        register={register("username", {
                            required: "Username is required",
                            minLength: {
                                value: 3,
                                message: "Username must be at least 3 characters long",
                            },
                        })}
                    />
                    {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                </div>

                <div className='flex flex-col md:flex-row gap-4 w-full my-4'>
                    <TextInput
                        label="First Name"
                        type="text"
                        placeholder="Firstname"
                        register={register("firstName", {
                            required: "Firstname is required",
                        })}
                    />
                    {errors.firstname && <p className="text-red-500 text-sm">{errors.firstname.message}</p>}

                    <TextInput
                        label="Last Name"
                        type="text"
                        placeholder="Lastname"
                        register={register("lastName", {
                            required: "Lastname is required",
                        })}
                    />
                    {errors.lastname && <p className="text-red-500 text-sm">{errors.lastname.message}</p>}
                </div>

                <div className="flex flex-col gap-4 w-full">
                    <PasswordInput
                        label="Create Password"
                        placeholder="Create Password"
                        register={register("password", {
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters long"
                            }
                        })}
                    />
                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

                    <PasswordInput
                        label="Confirm Password"
                        placeholder="Confirm Password"
                        register={register("confirmPassword", {
                            required: "Please confirm your password",
                            validate: (value) => value === watch("password") || "Passwords do not match",
                        })}
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}

                    <button
                        className='w-full bg-green-500 font-semibold p-2.5 text-black rounded-full mt-4'
                        onClick={handleSubmit(onSubmit)}
                    >
                        SIGN UP
                    </button>

                    <div className="mt-6 flex justify-center text-sm text-gray-400">
                        <span className="mr-2">Already have an account?</span>
                        <Link to="/login" className="underline text-white">Log in here.</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
