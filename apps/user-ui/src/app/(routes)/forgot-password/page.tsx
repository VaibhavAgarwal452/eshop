"use client"
import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react'
import { useForm } from "react-hook-form"
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import toast from "react-hot-toast"

type FormData = {
    email: string;
    password: string;
}

const Page = () => {
    const [step, setStep] = useState<"email" | "otp" | "reset">("email")
    const [otp, setOtp] = useState(["", "", "", ""])
    const [canResend, setCanResend] = useState(true)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [timer, setTimer] = useState<number>(60)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [serverError, setServerError] = useState<string | null>("")

    const router = useRouter()

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

    const startResendTimer = () => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const requestOtpMutation = useMutation({
        mutationFn: async ({ email }: { email: string }) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-password-user`, { email })
            return response.data
        },
        onSuccess: (_, { email }) => {
            setUserEmail(email)
            setStep("otp")
            setServerError(null)
            setCanResend(false)
            startResendTimer()
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error?.response?.data as { message?: string })?.message ?? "Invalid otp try again"
            setServerError(errorMessage)
        }
    })

    const verifyOtpMutation = useMutation({
        mutationFn: async () => {
            if (!userEmail) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password-user`, { email: userEmail, otp: otp.join("") })
            return response.data
        },
        onSuccess: () => {
            setStep("reset")
            setServerError(null)
        },
        onError: (error: AxiosError) => {
            console.log(error, "error")
            const errorMessage = (error?.response?.data as { message?: string })?.message ?? "Invalid otp try again"
            setServerError(errorMessage)
        }
    })

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ password }: { password: string }) => {
            if (!password) return;
            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/reset-password-user`, { email: userEmail, newPassword: password })
            return response.data
        },
        onSuccess: () => {
            setStep("email")
            toast.success("Password reset successfully! Please login with your new password")
            setServerError(null)
            router.push("/login")
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error?.response?.data as { message?: string })?.message ?? "Invalid otp try again"
            console.log(errorMessage, "error")
            setServerError(errorMessage)
        }
    })

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)
        if (value && index < inputRefs.current.length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }
    const onSubmitEmail = ({ email }: { email: string }) => {
        requestOtpMutation.mutate({ email })
    }

    const onSubmitPassword = ({ password }: { password: string }) => {
        resetPasswordMutation.mutate({ password })
    }
    const onSubmit = (data: FormData) => {
        console.log(data, "data")
    }
    return (
        <div className='w-full py-10 min-h-[85vh] bg-[#f1f1f1]'>
            <h1 className='text-4xl font-Poppins font-semibold text-black text-center'>Forgot Password</h1>
            <p className={`text-center text-lg font-medium py-3 text-[#000000099]`}>
                Home . Forgot-Password
            </p>
            <div className='w-full flex justify-center'>
                <div className='md:w-[480px] p-8 bg-white shadow rounded-lg'>
                    {step === "email" && <><h3 className='text-3xl font-semibold text-center mb-2'>
                        Forgot Password to eshop
                    </h3>
                        <p className='text-center text-gray-400 mb-4'>
                            Go Back to Login {" "}
                            <Link href="/login" className='text-blue-500'>Login
                            </Link>
                        </p>

                        <form onSubmit={handleSubmit(onSubmitEmail)}>


                            {errors.email && (<p className='text-red-500 text-sm'>
                                {String(errors.email.message)}
                            </p>)}

                            <label className='block text-gray-700 mb-1'> Email</label>
                            <input
                                type="email"
                                placeholder="user@example.com"
                                className="w-full p-2 border border-gray-300 outline-0 mb-1"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                                        message: "Invalid email address",
                                    },
                                })}
                            />
                            {errors.email && (<p className='text-red-500 text-sm'>
                                {String(errors.email.message)}
                            </p>)}


                            <button type='submit' disabled={requestOtpMutation.isPending} className='w-full mt-4 text-lg cursor-pointer bg-black text-white py-2 rounded-lg'>
                                {requestOtpMutation.isPending ? "sending otp..." : "submit"}
                            </button>
                            {serverError && (
                                <p className='text-red-500 text-sm mt-2'> {serverError}</p>
                            )}
                        </form>
                    </>}

                    {step === "otp" && (
                        <div>
                            <h3 className='text-xl font-semibold text-center mb-4'>
                                Enter Otp
                            </h3>
                            <div className='flex justify-center gap-6'>
                                {otp?.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        ref={(el) => {
                                            if (el) inputRefs.current[index] = el;
                                        }}
                                        maxLength={1}
                                        className='w-12 h-12 text-center border border-gray-300 outline-none !rounded'
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={e => handleOtpKeyDown(index, e)}
                                    />
                                ))}
                            </div>
                            <button disabled={verifyOtpMutation.isPending} onClick={() => verifyOtpMutation.mutate()} className='w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-lg'>
                                {verifyOtpMutation.isPending ? "Verifying..." : "Verify Otp"}
                            </button>
                            <p className='text-center text-sm mt-4'>
                                {canResend ? (<button onClick={() => requestOtpMutation.mutate({ email: userEmail! })} className='text-blue-500 cursor-pointer'>Resend otp</button>) : (`Resend Otp in ${timer} seconds`)}
                            </p>
                            {verifyOtpMutation.isError && verifyOtpMutation.error instanceof AxiosError && (
                                <p className='text-red-500 text-sm'>{verifyOtpMutation.error.message}</p>
                            )}
                        </div>
                    )}

                    {step === "reset" && (
                        <>
                            <h3 className='text-xl font-semibold text-center mb-4'>
                                Reset Password
                            </h3>
                            <form onSubmit={handleSubmit(onSubmitPassword)}>
                                <label className='block text-gray-700 mb-1'>New Password</label>
                                <input
                                    type='password'
                                    placeholder="Min. 6 characters"
                                    className="w-full p-2 border border-gray-300 outline-0 mb-1"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters",
                                        },
                                    })} />
                                {errors.password && (<p className='text-red-500 text-sm'>
                                    {String(errors.password.message)}
                                </p>)}

                                <button
                                    type='submit'
                                    className='w-full mt-4 text-lg cursor-pointer bg-black text-white'
                                    disabled={resetPasswordMutation.isPending}
                                >{resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}</button>
                                {serverError && (
                                    <p className='text-red-500 text-sm mt-2'> {serverError}</p>
                                )}
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Page