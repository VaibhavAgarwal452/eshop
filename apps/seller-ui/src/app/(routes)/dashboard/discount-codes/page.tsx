"use client"

import { ChevronRight, Plus, Trash, X } from 'lucide-react'
import React, { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import toast from "react-hot-toast"
import { Controller, useForm } from 'react-hook-form'
import Input from 'packages/components/input'
import DeleteDiscountModal from 'apps/seller-ui/src/shared/components/modals/delete.discount-codes'

const DiscountCodes = () => {
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedDiscount, setSelectedDiscount] = useState<any>(null)
    const queryClient = useQueryClient()

    const { data: discountCodes = [], isLoading } = useQuery({
        queryKey: ["shop-discounts"],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get("/product/api/get-discount-codes")
                return response?.data?.discount_codes || []
            } catch (error) {
                console.error(error)
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2
    })

    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        defaultValues: {
            public_name: "",
            discountType: "percentage",
            discountValue: "",
            discountCode: ""
        }
    })

    const createDiscountCodeMutation = useMutation({
        mutationFn: async (data) => {
            await axiosInstance.post("/product/api/create-discount-code", data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop-discounts"] })
            reset()
            setShowModal(false)
        }
    })

    const deleteDiscountCodeMutation = useMutation({
        mutationFn: async (discountId) => {
            await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop-discounts"] })
            setShowDeleteModal(false)
        }
    })

    const handleDeleteClick = async (discount: any) => {
        setShowDeleteModal(true)
        setSelectedDiscount(discount)
    }

    const onSubmit = (data: any) => {
        if (discountCodes.length >= 8) {
            toast.error("You can't create more than 8 discount codes")
            return
        }

        createDiscountCodeMutation.mutate(data)
    }
    return (
        <div className='w-full min-h-screen p-8'>
            <div className='flex justify-between items-center mb-1'>
                <h2 className='text-2xl text-white font-semibold'>Discount Codes</h2>
                <button className='bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 flex items-center gap-2 rounded-md'
                    onClick={() => setShowModal(true)}
                >
                    <Plus size={16} /> Create Discount
                </button>
            </div>


            <div className='flex items-center text-white'>
                <Link href={"/dashboard"} className='text-[#80Deea] cursor-pointer'>Dashboard</Link>
                <ChevronRight size={20} className='opacity-[.8]' />
                <span>Discount Codes</span>
            </div>

            <div className='mt-8 bg-gray-900 p-6 rounded-lg shadow-lg'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                    Your Discount Codes
                </h3>

                {isLoading ? (
                    <p className='text-white'>Loading...</p>
                ) : (
                    <table className='w-full text-white'>
                        <thead>
                            <tr className='border-b border-gray-800'>
                                <th className='p-3 text-left'>Title</th>
                                <th className='p-3 text-left'>Type</th>
                                <th className='p-3 text-left'>Value</th>
                                <th className='p-3 text-left'>Code</th>
                                <th className='p-3 text-left'>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {discountCodes.map((discountCode: any, index: any) => {
                                return <tr key={discountCode?.id} className='border-b border-gray-800 hover:bg-gray-800 transition'>
                                    <td className='p-3'>{discountCode?.public_name}</td>
                                    <td className='p-3 capitalize'>{discountCode?.discountType === "percent" ? "Percentage" : "Flat"}</td>
                                    <td className='p-3'>{discountCode?.discountType === "percent" ? `${discountCode?.discountValue}%` : `Rs. ${discountCode?.discountValue}`}</td>
                                    <td className='p-3'>{discountCode?.discountCode}</td>
                                    <td className='p-3'>
                                        <button
                                            onClick={() => handleDeleteClick(discountCode)}
                                            className='text-red-400 hover:text-red-600 transition'
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            })}

                        </tbody>

                    </table>
                )}

                {!isLoading && discountCodes.length === 0 && (<p className='text-gray-400 text-center mt-4'>
                    No Discount Codes Available
                </p>)}
            </div>


            {/* Create Discount Modal */}

            {showModal && (
                <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center'>
                    <div className='bg-gray-900 p-6 rounded-lg shadow-lg w-[450px]'>
                        <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                            <h3 className='text-xl text-white'>Create Discount Code</h3>
                            <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-white'>
                                <X size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className='mt-4'>
                            <Input
                                label='Title (Public Name)'
                                placeholder='Enter title'
                                {...register("public_name", { required: "Title is required" })}
                            />
                            {errors.public_name && (
                                <p className='text-red-500 text-sm mt-1'>{errors.public_name.message}</p>
                            )}

                            <div className='mt-2'>
                                <label className='block font-semibold text-gray-300 mb-1'>
                                    Discount Type
                                </label>

                                <Controller
                                    name="discountType"
                                    control={control}
                                    render={({ field }) => (
                                        <select {...field} className='w-full bg-gray-800 text-white py-2 px-3 rounded-md'>
                                            <option value="flat">Flat</option>
                                            <option value="percent">Percentage</option>
                                        </select>
                                    )}
                                />
                            </div>

                            <div className='mt-2'>

                                <Input
                                    label="Discount Value"
                                    type='number'
                                    min={1}
                                    {...register("discountValue", {
                                        required: "Value is required",
                                    })}
                                />
                            </div>

                            <div className='mt-2'>

                                <Input
                                    label="Discount Code"
                                    type='text'
                                    min={1}
                                    {...register("discountCode", {
                                        required: "discount code is required",
                                    })}
                                />
                            </div>


                            <button disabled={createDiscountCodeMutation.isPending} className='mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2'>
                                <Plus size={18} /> {createDiscountCodeMutation?.isPending ? "Creating..." : "Create"}
                            </button>

                            {createDiscountCodeMutation?.isError && (
                                <p className='text-red-500 text-sm mt-1'>
                                    {createDiscountCodeMutation?.error?.message}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && selectedDiscount && (
                <DeleteDiscountModal discount={selectedDiscount} onClose={() => setShowDeleteModal(false)} onConfirm={() => deleteDiscountCodeMutation.mutate(selectedDiscount?.id)} />
            )}
        </div>
    )
}

export default DiscountCodes